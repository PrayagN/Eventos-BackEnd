const Organizer = require("../models/organizerModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Events = require("../models/eventModel");


module.exports = {
  organizerAuth: async (req, res) => {
    try {
      let organizerData = await Organizer.findById(req.organizer_Id);
    
      if (organizerData) {
        const organizerdetails = {
          email: organizerData.email,
        };
        res.json({ auth: true, result: organizerdetails, status: 'success', message: 'Signin success' });
      } else {
        res.json({ auth: false, message: 'Organizer not found', status: 'error' });
      }
    } catch (error) {
      res.json({ auth: false, message: error.message, status: 'error' });
    }
  },
  postSignup: async (req, res) => {
    try {
      let { organizerName, email, password, mobile, event } = req.body;
      console.log(req.body);
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
        }).then((data) => {
          res.status(200).json({ status: true });
        });
      } else {
        res.status(200).json({ status: true });
      }
    } catch (error) {
      res.json({ message: "something gone wrong", status: false });
    }
  },
  postSignin: async (req, res) => {
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
          let token = jwt.sign({ id: organizerData._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: "30d",
          });
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
      res.json({ message: "something gone wrong", status: false });
    }
  },
  viewEvents: async (req, res) => {
    try {
        
      const events = await Events.find({});
      console.log(events);
      if (events) {
        res.json({ status: true, events });
      } else {
        res.json({ status: false });
      }
    } catch (error) {
      res.json({ status: false, message: error });
    }
  },
  profile : async(req,res)=>{
    try {
     console.log(req.organizer_Id,'a');
     const organizer_Id =req.organizer_Id
      const profile  = await Organizer.findById(organizer_Id)
    
      console.log(profile);
      res.json({profile})
    } catch (error) {
      res.json({message:error})
    }
  },
  updateProfile: async (req, res) => {
    try {
      console.log(req.body);
      const organizer_Id =req.organizer_Id
      const { organizerName, email, mobile, venue, budget, capacity, district, state, description,services,imageUrl } = req.body;
      let profileData = await Organizer.findById(organizer_Id);
     let newImages = profileData.images.concat(imageUrl)
      if (profileData) {
        await Organizer.findByIdAndUpdate(organizer_Id, {
          organizerName,
          email,
          mobile,
          venue,
          budget,
          capacity,
          district,
          state,
          description,
          service:services,
          images:newImages
        });
  
        res.json({ status: true, message: "Profile updated successfully!",service:profileData.service });
      } else {
        res.json({ status: false, message: "Profile not found" });
      }
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  loadOrganizers:async(req,res)=>{
    try {
      const organizers = await Organizer.find({})
      res.json({organizers})
    } catch (error) {
      res.json({message:error})
    }
  }
  
};
