const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const BookedEvents = require("../models/bookedEventsModel");
const Review = require('../models/reviewModal')
const Organizer = require('../models/organizerModel')
module.exports = {
  userAuth: async (req, res,next) => {
    const userId = req.decoded.id;

    const exp = req.decoded.exp * 1000;
    const date = Date.now();

    try {
      const userData = await User.findById(userId, { _id: 0, password: 0 });
      if (userData && exp > date) {
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
      next(error)
    }
  },
  postSignup: async (req, res,next) => {
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
        }).then((data) => {
          // userSignup.Status = true,
          let userData = User.findOne({ email: req.body.email });
          let token = jwt.sign({ id: userData._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "1d",
          });
          res.status(200).json({ status: true, token });
        });
      } else {
        res.status(200).json({ status: true });
      }
    } catch (error) {
      next(error)
    }
    },
    
    postSignin: async (req, res,next) => {
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
            { id: userData._id },
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
      } else {
        res.json({ message: "email does not exist", status: false });
      }
    } catch (error) {
      next(error)
    }
  },
  loadProfile: async (req, res,next) => {
    try {
      const user_id = req.decoded.id;
      const profile = await User.findById(user_id, { _id: 0, password: 0 });
      res.status(200).json({ profile });
    } catch (error) {
      next(error)
    }
  },
  updateProfile: async (req, res,next) => {
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
      next(error)
    }
  },
  bookedEvents: (req, res, next) => {
    try {
      const user_id = req.decoded.id;

      BookedEvents.find({ client: user_id })
        .populate("organizer", "organizerName budget event venue")
        .then((response) => {
          res.status(200).json({ essentialData: response });
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
          res.status(200).json({ message: "You already reviewed this organizer!" });
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
      res.status(404).json({ message: "You should want to book this organizer for rating" });      
      next(error);
    }
  },
  
  
};
