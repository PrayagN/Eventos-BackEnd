const express = require('express')
const userRoute = express();
const userController = require('../controllers/userController')
const adminController = require('../controllers/adminController')
const organizerController = require('../controllers/organizerController')
userRoute.post('/signup',userController.postSignup)
userRoute.post('/signin',userController.postSignin)
userRoute.get('/listEvent',adminController.loadEvents)
userRoute.get('/listOrganizers',organizerController.loadOrganizers)
module.exports = userRoute;