const Organizer = require("../models/organizerModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Events = require("../models/eventModel");
const Review = require("../models/reviewModal");
const BookedEvents = require("../models/bookedEventsModel");

module.exports = {
  organizerAuth: async (req, res, next) => {
    try {
      let organizerData = await Organizer.findById(req.organizer_Id);

      if (organizerData) {
        const organizerdetails = {
          email: organizerData.email,
        };
        res.json({
          auth: true,
          result: organizerdetails,
          status: "success",
          message: "Signin success",
        });
      } else {
        res.json({
          auth: false,
          message: "Organizer not found",
          status: "error",
        });
      }
    } catch (error) {
      next(error);
    }
  },
  postSignup: async (req, res, next) => {
    try {
      let { organizerName, email, password, mobile, event } = req.body;
      console.log(req.body);
      const eventId = (await Events.find({ title: event }, { _id: 1 }))[0]._id;
      let organizer = await Organizer.findOne({ email: email });
      if (organizer) {
        res.json({ status: false, message: "email already exists" });
      } else if (req.body.otp) {
        const password1 = await bcrypt.hash(password, 10);
        console.log("created");
        Organizer.create({
          organizerName: organizerName,
          email: email,
          password: password1,
          mobile: mobile,
          event: event,
          eventId: eventId,
          status: "false",
        }).then((data) => {
          res.status(200).json({ status: true });
        });
      } else {
        res.status(200).json({ status: true });
      }
    } catch (error) {
      next(error);
    }
  },
  postSignin: async (req, res, next) => {
    try {
      console.log(req.body);
      let organizerData = await Organizer.findOne({ email: req.body.email });
      if (organizerData) {
        console.log("sdf");
        const passwordMatch = await bcrypt.compare(
          req.body.password,
          organizerData.password
        );
        if (passwordMatch) {
          console.log("h");
          const organizerName = organizerData.organizerName;
          let token = jwt.sign(
            { id: organizerData._id },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: "30d",
            }
          );
          res.json({
            message: "Login Successful",
            status: true,
            token,
            organizerName,
          });
        } else {
          res.json({ message: "password is incorrect", status: false });
        }
      } else {
        res.json({ message: "email does not exist", status: false });
      }
    } catch (error) {
      next(error);
    }
  },
  loadDashboard: async (req, res, next) => {
    try {
      const organizer_Id = req.organizer_Id;
      const booked = await BookedEvents.find({ organizer: organizer_Id });
      const totalBooking = booked.length;
      let totalEarning = 0;
      booked.forEach((money) => {
        totalEarning += money.totalAmount;
      });
      const monthlyTotals = {};
      booked.forEach((booking) => {
        const monthYear = booking.bookedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

        if (!monthlyTotals[monthYear]) {
          monthlyTotals[monthYear] = 0;
        }
        monthlyTotals[monthYear]+=booking.totalAmount
      });
      console.log(monthlyTotals);
      const cancelled = await BookedEvents.find({
        organizer: organizer_Id,
        payment: "Refunded",
      }).count();
      const upcoming = await BookedEvents.find({
        organizer: organizer_Id,
        payment: "Advance Only",
      }).count();
      res.status(200).json({ totalBooking, cancelled, upcoming, totalEarning,monthlyTotals });
    } catch (error) {
      next(error);
    }
  },

  viewEvents: async (req, res, next) => {
    try {
      const events = await Events.find({});
      console.log(events);
      if (events) {
        res.json({ status: true, events });
      } else {
        res.json({ status: false });
      }
    } catch (error) {
      next(error);
    }
  },
  profile: async (req, res, next) => {
    try {
      const organizer_Id = req.organizer_Id;
      const profile = await Organizer.findById(organizer_Id, {
        password: 0,
        _id: 0,
      });

      res.json({ profile });
    } catch (error) {
      next(error);
    }
  },
  updateProfile: async (req, res, next) => {
    try {
      const organizer_Id = req.organizer_Id;
      const {
        organizerName,
        email,
        mobile,
        venue,
        budget,
        district,
        advance,
        description,
        services,
        imageUrl,
        logoUrl,
      } = req.body;
      let profileData = await Organizer.findById(organizer_Id);

      let newImages = profileData.images.concat(imageUrl);
      const District = district.toLowerCase();
      if (profileData) {
        await Organizer.findByIdAndUpdate(organizer_Id, {
          organizerName,
          email,
          mobile,
          venue,
          budget,
          advance,
          district,
          description,
          service: services,
          images: newImages,
          logo: logoUrl,
        });

        res.json({
          status: true,
          message: "Profile updated successfully!",
          service: profileData.service,
        });
      } else {
        res.json({ status: false, message: "Profile not found" });
      }
    } catch (error) {
      next(error);
    }
  },

  loadOrganizers: async (req, res, next) => {
    try {
      const page = parseInt(req.query.activePage) || 1;
      const size = parseInt(req.query.organizerLimitPerPage) || 1;
      const skip = (page - 1) * size;
      const searchQuery = req.query.searchQuery;
      const selectedEvent = req.query.selectedEvent;
      const selectedDistrict = req.query.selectedDistrict;

      const query = {
        status: true,
      };

      if (searchQuery) {
        query.$or = [
          { organizerName: { $regex: searchQuery, $options: "i" } },
          { venue: { $regex: searchQuery, $options: "i" } },
          { event: { $regex: searchQuery, $options: "i" } },
          { district: { $regex: searchQuery, $options: "i" } },
        ];
      }

      if (selectedEvent !== "All") {
        query.event = selectedEvent;
      }

      if (selectedDistrict) {
        query.district = selectedDistrict;
      }

      const total = await Organizer.countDocuments(query);
      const events = await Events.find({});
      const review = await Review.find({});
      const organizer = await Organizer.find();
      const rating = await Organizer.aggregate([
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
            (organizer.ratingCount / (organizer.reviewCount * 5)) * 5;
        } else {
          organizer.rating = 0; // or any default value you want to assign when ratingCount is zero
        }
      });

      const districtSet = new Set();
      organizer.forEach((organizer) => {
        districtSet.add(organizer.district);
      });
      const district = Array.from(districtSet);

      const response = await Organizer.find(
        { ...query, status: true },
        { password: 0, status: 0 }
      )
        .populate("review")
        .lean()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(size);

      res.status(200).json({
        organizers: response,
        total,
        page,
        size,
        events,
        review,
        district,
        rating,
      });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
    }
  },

  bookedClients: async (req, res, next) => {
    try {
      const page = parseInt(req.query.activePage) || 1;
      const size = 1;
      const skip = (page - 1) * size;
      const searchQuery = req.query.searchQuery;
      const query = {
        status: true,
        organizer: req.organizer_Id,
      };
      if (searchQuery) {
        query.$or = [
          { "client.username": { $regex: searchQuery, $options: "i" } },
          { payment: { $regex: new RegExp(searchQuery, "i") } },
        ];
      }

      const total = await BookedEvents.countDocuments(query);
      const response = await BookedEvents.find(query)
        .populate("client", "username image email")
        .lean()
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(size);

      res.status(200).json({ detail: response, total, page, size });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
      // Or you can pass the error to the error handling middleware using `next(error)`
      // next(error);
    }
  },

  updatePaymentStatus: async (req, res, next) => {
    try {
      const book_id = req.body.id;

      await BookedEvents.findByIdAndUpdate(book_id, {
        $set: { payment: "Full paid" },
      })
        .then((response) => {
          res.status(200).json({ message: "payment status updated" });
        })
        .catch((error) => {
          res.status(500).json({ message: "something went wrong" });
        });
    } catch (error) {
      next(error);
    }
  },
};
