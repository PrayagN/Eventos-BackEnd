const express =require('express')
const organizerRoute = express()
const organizerController = require('../controllers/organizerController')
const {organizerProtect} = require('../middleware/Auth')

organizerRoute.get('/isOrganizerAuth',organizerProtect,organizerController.organizerAuth)
organizerRoute.post('/signup',organizerController.postSignup)
organizerRoute.post('/signin',organizerController.postSignin)
organizerRoute.get('/viewEvents',organizerController.viewEvents)
organizerRoute.get('/profile',organizerProtect,organizerController.profile)
organizerRoute.post('/updateProfile',organizerProtect,organizerController.updateProfile)
module.exports = organizerRoute