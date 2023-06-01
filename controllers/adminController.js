const Admin = require('../models/adminModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = {
  postSignin: async (req, res) => {
    try {
      const { email, password } = req.body;
      let adminData = await Admin.findOne({ email });
      if (adminData) {
        const passwordMatch = await bcrypt.compare(password, adminData.password);
        if (passwordMatch) {
          let token = jwt.sign({ id: adminData._id }, 'secretCodeforAdmin', { expiresIn: '5d' });
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
  }
};
