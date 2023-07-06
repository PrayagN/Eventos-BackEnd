require("dotenv").config();

const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const BookedEvents = require("../models/bookedEventsModel");
const Review = require("../models/reviewModal");
const Organizer = require("../models/organizerModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
module.exports = {
  userAuth: async (req, res, next) => {
    const userId = req.decoded.id;
    try {
      const userData = await User.findById(userId, { _id: 0, password: 0 });
      if (userData) {
        res.status(200).json({
          auth: true,
          userData,
          status: true,
        });
      } else {
        res
          .status(401)
          .json({ auth: false, message: "session expired", status: false });
        console.log("expired");
      }
    } catch (error) {
      next(error);
    }
  },
  postSignup: async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email });

      if (user) {
        res.json({ status: false, message: "email already exists" });
      } else if (req.body.otp) {
        const password1 = await bcrypt.hash(req.body.password, 10);

        User.create({
          username: req.body.username,
          email: req.body.email,
          password: password1,
          mobile: req.body.mobile,
        }).then((data) => {
          // userSignup.Status = true,
          res.status(200).json({ status: true });
        });
      } else if (req.body.exp) {
        const password1 = await bcrypt.hash(req.body.password, 10);

        User.create({
          username: req.body.username,
          email: req.body.email,
          password: password1,
          // mobile:mobile
        }).then(async(data) => {
          // userSignup.Status = true,
          let userData = await User.findOne({ email: req.body.email });
          let token = jwt.sign(
            { id: userData._id, role: "user" },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: "1d",
            }
          );
          res.status(200).json({ status: true, token });
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
      let userData = await User.findOne({ email: req.body.email });

      if (userData) {
        const passwordMatch = await bcrypt.compare(
          req.body.password,
          userData.password
        );
        if (passwordMatch) {
          const username = userData.username;
          let token = jwt.sign(
            { id: userData._id, role: "user" },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1d" }
          );
          res.json({
            message: "Login Successful",
            status: true,
            token,
            username,
          });
        } else {
          res.json({ message: "password is incorrect", status: false });
        }
      }else if (req.body.exp) {
        const password1 = await bcrypt.hash(req.body.password, 10);

        User.create({
          username: req.body.username,
          email: req.body.email,
          password: password1,
          // mobile:mobile
        }).then(async(data) => {
          // userSignup.Status = true,
          let userData = await User.findOne({ email: req.body.email });
          const username = userData.username;
          let token = jwt.sign(
            { id: userData._id, role: "user" },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "1d" }
          );
          res.json({
            message: "Login Successful",
            status: true,
            token,
          
          });
        })
    }
      
      else {
        res.json({ message: "email does not exist", status: false });
      }
    } catch (error) {
      next(error);
    }
  },
  loadProfile: async (req, res, next) => {
    try {
      const user_id = req.decoded.id;
      const profile = await User.findById(user_id, { _id: 0, password: 0 });
      res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  },
  updateProfile: async (req, res, next) => {
    try {
      const user_id = req.decoded.id;
      const { username, mobile, district, state, imageUrl } = req.body;

      const userData = await User.findById(user_id, { password: 0, _id: 0 });
      if (userData) {
        await User.findByIdAndUpdate(user_id, {
          username,
          mobile,
          state,
          district,
          image: imageUrl,
        });
      }
      res.status(200).json({ status: true, message: "successfully updated" });
    } catch (error) {
      next(error);
    }
  },
  bookedEvents: (req, res, next) => {
  try {
    const user_id = req.decoded.id;
    const today = new Date();

    const futureEvents = BookedEvents.find({ client: user_id, eventScheduled: { $gt: today } })
      .populate("organizer", "organizerName budget event venue");
      
    const pastEvents = BookedEvents.find({ client: user_id, eventScheduled: { $lt: today } })
      .populate("organizer", "organizerName budget event venue");

    Promise.all([futureEvents, pastEvents])
      .then(([futureResponse, pastResponse]) => {
        const formattedFutureEvents = futureResponse.map(event => {
          return {
            ...event._doc,
            eventScheduled: event.eventScheduled.toISOString() // Convert eventScheduled to ISO string format
          };
        });

        const formattedPastEvents = pastResponse.map(event => {
          return {
            ...event._doc,
            eventScheduled: event.eventScheduled.toISOString() // Convert eventScheduled to ISO string format
          };
        });

        res.status(200).json({ futureEvents: formattedFutureEvents, pastEvents: formattedPastEvents });
      });
  } catch (error) {
    next(error);
  }
},

  
  reviewOrganizer: async (req, res, next) => {
    try {
      const { id } = req.body;
      const organizer_Id = id;
      const user_id = req.decoded.id;

      const bookedEvent = await BookedEvents.findOne({
        $and: [{ client: user_id }, { organizer: organizer_Id }],
      });

      if (bookedEvent) {
        const existingReview = await Review.findOne({
          reviewedBy: user_id,
          organizer: organizer_Id,
        }).populate("reviewedBy");

        if (existingReview) {
          res
            .status(200)
            .json({ message: "You already reviewed this organizer!" });
        } else {
          if (!req.body.review) {
            res.status(200).json({ status: true });
          } else {
            const review = await Review.create({
              reviewedBy: user_id,
              organizer: organizer_Id,
              rating: req.body.rating,
              review: req.body.review,
            });

            await Organizer.findByIdAndUpdate(
              { _id: organizer_Id },
              { $set: { review: review._id } }
            );

            res.status(200).json({ message1: "Review posted successfully!" });
          }
        }
      } else {
        throw new Error("You should book this organizer to submit a review.");
      }
    } catch (error) {
      res
        .status(404)
        .json({ message: "You should want to book this organizer for rating" });
      next(error);
    }
  },
  cancelBooking: async (req, res, next) => {
    try {
      const booking_id = req.body.id;
      const payment = await BookedEvents.findById(
        { _id: booking_id },
        { paymentIntentId: 1, advanceAmount: 1, eventScheduled: 1 }
      );
      const today = new Date();
      const eventDate = new Date(payment.eventScheduled);
      function getDaysDifference(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs((date1 - date2) / oneDay));
      }
      let amount;
      const difference = getDaysDifference(today, eventDate);
      if (difference <= 7) {
        amount = payment.advanceAmount - payment.advanceAmount * 0.5;
      } else {
        amount = payment.advanceAmount - payment.advanceAmount * 0.25;
      }

      await BookedEvents.findByIdAndUpdate(
        { _id: booking_id },
        {
          $set: {
            payment: "Refunded",
            fine: amount,
            totalAmount: amount,
            advanceAmount: 0,
          },
        },
        { upsert: true, new: true }
      );

      const refund = await stripe.refunds.create({
        payment_intent: payment.paymentIntentId,
        amount: amount * 100,
      });

      res
        .status(200)
        .json({
          message:
            "Successfully cancelled and the refund amount will be credited soon!!",
        });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong" });
      next(error)
    }
  },
};
