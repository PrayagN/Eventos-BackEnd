const express =require('express')
const organizerRoute = express()
const organizerController = require('../controllers/organizerController')

organizerRoute.post('/exist',organizerController.checkExist)
organizerRoute.post('/signup',organizerController.postSignup)
organizerRoute.post('/signin',organizerController.postSignin)
module.exports = organizerRoute