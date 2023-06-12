const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  userAuth: async (req, res) => {
    const userId = req.decoded.id;

    const exp = req.decoded.exp * 1000;
    const date = Date.now();
    console.log(date);

    try {
      let userData = await User.findById(userId);
      if (userData && exp > date) {
        console.log("yes");
        res.status(200).json({
          auth: true,
          userData,
          status: true,
        });
      } else {
        res.status(401).json({ auth: false, message: "session expired", status:false });
        console.log("expired");
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
          expiresIn: "1d",
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
      console.log(error);
      res.json({ message: "something gone wrong", status: false });
    }
  },
};
