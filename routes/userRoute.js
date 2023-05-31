const express = require('express')
const userRoute = express();
const userController = require('../controllers/userController')

userRoute.post('/signup',userController.postSignup)
userRoute.post('/signin',userController.postSignin)
module.exports = userRoute;