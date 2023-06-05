const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  userAuth: async (req, res) => {
    console.log('userAuth1');
    try {
      let userData = await User.findById(req.userId);
      if (userData) {
        const userdetails = {
          email: userData.email,
        };

        res.json({
          auth: true,
          result: userdetails,
          status: "success",
          message: "Signin success",
        });
      } else {
        res.json({ auth: false, message: "user not found", status: "error" });
      }
    } catch (error) {
      res.json({ auth: false, message: error.message, status: "error" });
    }
  },
  postSignup: async (req, res) => {
    
    console.log("etghi");
    console.log(req.body.exp);

    // let { username, email, password, mobile } = req.body;

    console.log(req.body.password);
    let user = await User.findOne({ email: req.body.email });

    if (user) {
      res.json({ status: false, message: "email already exists" });
    } else if (req.body.otp) {
      const password1 = await bcrypt.hash(req.body.password, 10);
      console.log("created");
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
      console.log("gggp");
      const password1 = await bcrypt.hash(req.body.password, 10);
      console.log("created");
      User.create({
        username: req.body.username,
        email: req.body.email,
        password: password1,
        // mobile:mobile
      }).then((data) => {
        // userSignup.Status = true,
        let userData = User.findOne({ email: req.body.email });
        let token = jwt.sign({ id: userData._id }, process.env.JWT_SECRET_KEY, {
          expiresIn: "5d",
        });
        res.status(200).json({ status: true, token });
      });
    } else {
      res.status(200).json({ status: true });
    }
  },

  postSignin: async (req, res) => {
    try {
      let userData = await User.findOne({ email: req.body.email });

      if (userData) {
        console.log("sdf");
        const passwordMatch = await bcrypt.compare(
          req.body.password,
          userData.password
        );
        if (passwordMatch) {
          console.log("h");
          const username = userData.username;
          let token = jwt.sign(
            { id: userData._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "5d" }
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
      console.log(error);
      res.json({ message: "something gone wrong", status: false });
    }
  },
};
