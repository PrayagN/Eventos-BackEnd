const Admin = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Event = require("../models/eventModel");
const Organizers = require("../models/organizerModel");
const User = require("../models/userModel");
const BookedEvents = require("../models/bookedEventsModel");
const Review = require("../models/reviewModal");
module.exports = {
  postSignin: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const adminData = await Admin.findOne({ email });
      if (adminData) {
        const passwordMatch = await bcrypt.compare(
          password,
          adminData.password
        );
        if (passwordMatch) {
          let token = jwt.sign(
            { id: adminData._id,role:'admin' },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "5d" }
          );
          res
            .status(200)
            .json({ message: "Login Successful", status: true, token });
        } else {
          res.json({ message: "Password is incorrect", status: false });
        }
      } else {
        res.json({ message: "Email does not exist", status: false });
      }
    } catch (error) {
      next(error);
    }
  },

  adminAuth: async (req, res, next) => {
    try {
      let adminData = await Admin.findById(req.adminId);
      if (adminData) {
        const admindetails = {
          email: adminData.email,
        };

        res.json({
          auth: true,
          result: admindetails,
          status: "success",
          message: "Signin success",
        });
      } else {
        res.json({ auth: false, message: "Admin not found", status: "error" });
      }
    } catch (error) {
      next(error);
    }
  },

  loadDashboard: async (req, res, next) => {
    try {
      const bookedEvents = await BookedEvents.find()
        .populate("organizer", "-id -password")
        .populate("client", "-_id -password");
      const bookedData = bookedEvents.map((event) => ({
        totalAmount: event.totalAmount,
        advanceAmount: event.advanceAmount,
        organizerName: event.organizer.organizerName,
        clientName: event.client.username,
        event: event.organizer.event,
        eventScheduled: event.eventScheduled,
        paymentStatus: event.payment,
      }));

      let totalEarning = 0;
      bookedEvents.forEach((money) => {
        totalEarning += money.totalAmount;
      });

      const organizers = await Organizers.find(
        {},
        { organizerName: 1, logo: 1, _id: 1 }
      );
      const clients = await User.find({}, { username: 1 });

      const organizerCount = organizers.length;
      const clientCount = clients.length;
      const bookedCount =await BookedEvents.countDocuments({advanceAmount:{$ne:0}})
      const necessaryData = {
        bookedEvents,
        organizers,
        organizerCount,
        clientCount,
        bookedCount,
        totalEarning,
        bookedData,
      };
      res.status(200).json({ necessaryData });
    } catch (error) {
      next(error);
    }
  },
  addEvents: async (req, res, next) => {
    try {
      if (req.file && req.file.path) {
        Event.create({
          title: req.body.title,
          image: req.file.filename,
        }).then((data) => {
          res.json({ status: true, message: "Event added successfully" });
        });
      } else {
        res.json({ status: false, message: "invalid image type" });
      }
    } catch (error) {
      next(error);
    }
  },
  loadEvents: async (req, res, next) => {
    try {
      const events = await Event.find({});

      res.json({ events });
    } catch (error) {
      next(error);
    }
  },
  listOrganizers: async (req, res, next) => {
    try {
      const organizers = await Organizers.find({});
      res.json({ organizers });
    } catch (error) {
      next(error);
    }
  },
  listCustomers: async (req, res, next) => {
    try {
      const page = parseInt(req.query.activePage) || 1;
      const size = 5;
      const skip = (page - 1) * size;
      const searchQuery = req.query.searchValue;
      const query = {};
      if (searchQuery) {
        query.$or = [
          { username: { $regex: searchQuery, $options: "i" } },
          { email: { $regex: searchQuery, $options: "i" } },
          { mobile: { $regex: searchQuery, $options: "i" } }, // Add phone number search

        ];
      }
      const total = await User.find().countDocuments()
       await User.find(query,{password:0,_id:0}).lean().sort({createdAt:1}).skip(skip).limit(size).then((response)=>{
        
         res.status(200).json({ customers:response, total,page,size });
       }).catch((error)=>{
        res.status(500).json({message:'something went wrong'})
       })
    } catch (error) {
      next(error);
    }
  },
  viewOrganizer: async (req, res, next) => {
    try {
      const { id } = req.body;

      const booked = await BookedEvents.find({ organizer: id });
      const bookedDates = booked.map((event) => event.eventScheduled);
      const count = booked.length;

      const review = await Review.find({ organizer: id }).populate(
        "reviewedBy",
        "username image createdAt"
      );

      const organizer = await Organizers.findById(id);
      if (organizer) {
        res
          .status(200)
          .json({ status: true, organizer, bookedDates, count, review });
      } else {
        res
          .status(401)
          .json({ status: false, message: "Something went wrong" });
      }
    } catch (error) {
      next(error);
    }
  },

  acceptOrganizer: async (req, res, next) => {
    try {
      const { id } = req.body;
      const organizer = await Organizers.findById(id);
      if (organizer.status === "false") {
        organizer.status = "true";
        await organizer.save();
        res.json({ status: true });
      } else if (organizer.status === "true") {
        organizer.status = "false";
        await organizer.save();
        res.json({ statuses: true });
      }
    } catch (error) {
      next(error);
    }
  },
  eventOrganizers: async (req, res, next) => {
    try {
      const id = req.body.id;
      const page = Math.floor(req.body.activePage) || 1;
      const size = Math.floor(req.body.size) || 2;
      const skip = (page - 1) * size;
      const searchQuery = req.body.searchQuery;

      const query = {
        status: true,
      };
      if (searchQuery) {
        query.$or = [
          { organizerName: { $regex: searchQuery, $options: "i" } },
          { venue: { $regex: searchQuery, $options: "i" } },
          { district: { $regex: searchQuery, $options: "i" } },
        ];
      }

      const event = await Event.findById(id);
      
      const eventPhoto = event?.image;
      const total = await Organizers.countDocuments({ ...query, eventId: id });
      const rating = await Organizers.aggregate([
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "organizer",
            as: "reviews",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            reviewCount: { $size: "$reviews" },
            ratingCount: { $sum: "$reviews.rating" },
          },
        },
      ]);

      rating.forEach((organizer) => {
        if (organizer.ratingCount !== 0) {
          organizer.ratings =
            organizer.ratingCount / (organizer.reviewCount * 5)*5;
        } else {
          organizer.rating = 0; // or any default value you want to assign when ratingCount is zero
        }
      });
      await Organizers.find(
        { ...query, status: true, eventId: id },
        { password: 0, status: 0 }
      )
        .lean()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(size)
        .then((response) => {
          res
            .status(200)
            .json({ organizers: response, total, page, size, eventPhoto,rating });
        })
        .catch((error) => {
          res.status(500).json({ message: "something went wrong" });
        });
    } catch (error) {
      next(error);
    }
  },
  bookedEventsData: async (req, res, next) => {
  try {
    const page = Math.floor(req.query.activePage) || 1;
    const size = Math.floor(req.query.size) || 4;
    const skip = (page - 1) * size;
    const searchQuery = req.query.searchQuery;
    const query = {};
    if (searchQuery) {
      query.$or = [
        { "organizer.organizerName": { $regex: searchQuery, $options: "i" } },
        { venue: { $regex: searchQuery, $options: "i" } },
        { district: { $regex: searchQuery, $options: "i" } },
        { "client.username": { $regex: searchQuery, $options: "i" } },
      ];
    }
    const total = await BookedEvents.countDocuments(query);
    
    const bookedEvents = await BookedEvents.find(query)
      .populate("organizer", "organizerName event")
      .populate("client", "-_id -password")
      
      .lean()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size);

    const necessaryData = bookedEvents.map((event) => ({
      _id: event._id,
      totalAmount: event.totalAmount,
      advanceAmount: event.advanceAmount,
      organizerName: event.organizer.organizerName,
      clientName: event.client.username,
      clientEmail: event.client.email,
      event: event.organizer.event,
      eventScheduled: event.eventScheduled,
      bookedDate: event.bookedDate,
      paymentStatus: event.payment,
    }));
    if (necessaryData) {
      res.status(200).json({ necessaryData, total, page, size });
    } else {
      return res
        .status(500)
        .json({ message: "something went wrong while fetching data" });
    }
  } catch (error) {
    next(error);
  }
},

};
