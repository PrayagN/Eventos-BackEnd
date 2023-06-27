const express = require("express");
const userRoute = express();
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");
const organizerController = require("../controllers/organizerController");
const paymentController = require('../controllers/paymentController')
const chatBotController = require('../controllers/chatBotController')
const messageController = require('../controllers/messageController')
const { userProtect } = require("../middleware/Auth")
userRoute.get('/isUserAuth',userProtect, userController.userAuth);
userRoute.post("/signup", userController.postSignup);
userRoute.post("/signin", userController.postSignin);

userRoute.get("/listEvent",adminController.loadEvents);
userRoute.post('/eventOrganizers',adminController.eventOrganizers)

userRoute.get("/listOrganizers", organizerController.loadOrganizers);
userRoute.post('/viewOrganizer',adminController.viewOrganizer)

userRoute.get('/profile',userProtect,userController.loadProfile)
userRoute.put('/updateProfile',userProtect,userController.updateProfile)
userRoute.get('/booked-events',userProtect,userController.bookedEvents)
userRoute.post('/review-organizer',userProtect,userController.reviewOrganizer)
userRoute.post('/cancel-booking',userProtect,userController.cancelBooking)


userRoute.post('/create-checkout-session',userProtect,paymentController.checkoutPayment)
userRoute.get('/verifyPayment/:order_id/:organizer_id',userProtect,paymentController.verifyPayment)
userRoute.get('/cancelPayment/:order_id',userProtect,paymentController.cancelPayment)

// userRoute.post('/chatbot',chatBotController.chatBot)
userRoute.post('/buildConnection',userProtect,chatBotController.chatConnection)
userRoute.get('/getConnections',userProtect,chatBotController.getConnections)

userRoute.post('/sendMessage',userProtect,messageController.sendMessage)
userRoute.get('/getMessages/:id',userProtect,messageController.getMessages)
module.exports = userRoute;
