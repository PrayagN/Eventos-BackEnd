const Admin = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Event = require("../models/eventModel");
const Organizers = require("../models/organizerModel");
const User = require("../models/userModel");
const BookedEvents = require("../models/bookedEventsModel");

module.exports = {
  postSignin: async (req, res) => {
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
            { id: adminData._id },
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
      res.status(500).json({ message: "Something went wrong", status: false });
    }
  },

  adminAuth: async (req, res) => {
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
      res.json({ auth: false, message: error.message, status: "error" });
    }
  },

  loadDashboard : async(req,res,next)=>{
    try {
      const bookedEvents  = await BookedEvents.find()
      const organizers = await Organizers.find({},{organizerName:1,logo:1,_id:1})
      
      const organizerCount = organizers.length
      const necessaryData ={
        bookedEvents,organizers,organizerCount,
      }
      res.status(200).json({necessaryData})
    } catch (error) {
      next(error)
    }
  },
  addEvents: async (req, res) => {
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
      res.json({ message: error });
    }
  },
  loadEvents: async (req, res) => {
    try {
      const events = await Event.find({});

      res.json({ events });
    } catch (error) {
      res.json({ message: error });
    }
  },
  listOrganizers: async (req, res) => {
    try {
      const organizers = await Organizers.find({});
      res.json({ organizers });
    } catch (error) {
      res.json({ message: error });
    }
  },
  listCustomers: async (req, res) => {
    try {
      const customers = await User.find({});
      res.json({ customers });
    } catch (error) {
      res.json({ message: error });
    }
  },
  viewOrganizer: async (req, res) => {
    try {
      const { id } = req.body;

      const booked = await BookedEvents.find({ organizer: id });
      const bookedDates = booked.map((event) => event.eventScheduled);
      const count = booked.length;

      const organizer = await Organizers.findById(id);

      if (organizer) {
        res.status(200).json({ status: true, organizer, bookedDates, count });
      } else {
        res
          .status(401)
          .json({ status: false, message: "Something went wrong" });
      }
    } catch (error) {
      res.json({ message: error });
    }
  },

  acceptOrganizer: async (req, res) => {
    try {
      const { id } = req.body;
      const organizer = await Organizers.findById(id);
      console.log(organizer);
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
      res.json({ message: error });
    }
  },
  eventOrganizers: async (req, res, next) => {
    try {
      const { id } = req.body;
      const event = await Event.findById(id);
      const eventPhoto = event?.image;
      await Organizers.find({ eventId: id })
        .then((response) => {
          return res.status(200).json({ organizers: response, eventPhoto });
        })
        .catch((error) => {
          return res
            .status(500)
            .json({ message: "something went wrong while fetching data" });
        });
    } catch (error) {
      next(error);
    }
  },
  bookedEventsData: async (req, res, next) => {
    try {
      const bookedEvents = await BookedEvents.find({})
        .populate("organizer")
        .populate("client");

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
        res.status(200).json({ necessaryData });
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
