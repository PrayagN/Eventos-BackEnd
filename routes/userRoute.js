const express = require("express");
const userRoute = express();
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");
const organizerController = require("../controllers/organizerController");
const paymentController = require('../controllers/paymentController')
const { userProtect } = require("../middleware/Auth")
userRoute.get('/isUserAuth',userProtect, userController.userAuth);
userRoute.post("/signup", userController.postSignup);
userRoute.post("/signin", userController.postSignin);

userRoute.get("/listEvent",adminController.loadEvents);

userRoute.get("/listOrganizers", organizerController.loadOrganizers);
userRoute.post('/viewOrganizer',adminController.viewOrganizer)

userRoute.get('/profile',userProtect,userController.loadProfile)
userRoute.put('/updateProfile',userProtect,userController.updateProfile)


userRoute.post('/create-checkout-session',userProtect,paymentController.checkoutPayment)
userRoute.get('/verifyPayment/:order_id/:organizer_id',paymentController.verifyPayment)
userRoute.get('/cancelPayment/:order_id',paymentController.cancelPayment)
module.exports = userRoute;
