const express =require('express')
const organizerRoute = express()
const organizerController = require('../controllers/organizerController')
const {organizerProtect} = require('../middleware/Auth')

// organizerRoute.post('/exist',organizerController.checkExist)
organizerRoute.post('/signup',organizerController.postSignup)
organizerRoute.post('/signin',organizerController.postSignin)
organizerRoute.get('/viewEvents',organizerController.viewEvents)
module.exports = organizerRoute