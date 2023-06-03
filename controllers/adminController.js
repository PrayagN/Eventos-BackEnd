const Admin = require('../models/adminModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Event = require('../models/eventModel')
module.exports = {
  postSignin: async (req, res) => {
    try {
      const { email, password } = req.body;
      let adminData = await Admin.findOne({ email });
      if (adminData) {
        const passwordMatch = await bcrypt.compare(password, adminData.password);
        if (passwordMatch) {
          let token = jwt.sign({ id: adminData._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' });
          res.status(200).json({ message: 'Login Successful', status: true, token });
        } else {
          res.json({ message: 'Password is incorrect', status: false });
        }
      } else {
        res.json({ message: 'Email does not exist', status: false });
      }
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong', status: false });
    }
  },
  
  adminAuth: async (req, res) => {
    try {
      let adminData = await Admin.findById(req.adminId);
      if (adminData) {
        const admindetails = {
          email: adminData.email,
        };
        res.json({ auth: true, result: admindetails, status: 'success', message: 'Signin success' });
      } else {
        res.status(404).json({ auth: false, message: 'Admin not found', status: 'error' });
      }
    } catch (error) {
      res.status(400).json({ auth: false, message: error.message, status: 'error' });
    }
  },
  addEvents:async(req,res)=>{
    try {
      console.log(req.body.formData,'df');
      if(req.file && req.file.path){
      //  const date = Date().slice(0,15);
        Event.create({
          title:req.body.title,
          image:req.file.filename,
          // date:date
        }).then((data)=>{
          res.json({status:true,message:'Event added successfully'})
        })
      }else{
        res.json({status:false,message:'invalid image type'})
      }
    } catch (error) {
      res.json({message:error})
    }
  },
  loadEvents:async(req,res)=>{
    try {
        const events = await Event.find({})
        console.log(events,'kiti');
        res.json({events})
    } catch (error) {
      res.json({message:error})
    }
  }

};
