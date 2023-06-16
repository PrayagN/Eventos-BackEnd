const express = require("express");
const userRoute = express();
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");
const organizerController = require("../controllers/organizerController");
const { userProtect } = require("../middleware/Auth")
userRoute.get('/isUserAuth',userProtect, userController.userAuth);
userRoute.post("/signup", userController.postSignup);
userRoute.post("/signin", userController.postSignin);
userRoute.get("/listEvent",adminController.loadEvents);
userRoute.get("/listOrganizers", organizerController.loadOrganizers);
userRoute.get('/profile',userProtect,userController.loadProfile)
userRoute.put('/updateProfile',userProtect,userController.updateProfile)
userRoute.post('/viewOrganizer',adminController.viewOrganizer)
module.exports = userRoute;
