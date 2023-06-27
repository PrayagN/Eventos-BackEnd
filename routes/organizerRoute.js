const express =require('express')
const organizerRoute = express()
const organizerController = require('../controllers/organizerController')
const {organizerProtect} = require('../middleware/Auth')
const chatBotController =require('../controllers/chatBotController')
const messageController = require('../controllers/messageController')

organizerRoute.get('/isOrganizerAuth',organizerProtect,organizerController.organizerAuth)
organizerRoute.post('/signup',organizerController.postSignup)
organizerRoute.post('/signin',organizerController.postSignin)
organizerRoute.get('/viewEvents',organizerController.viewEvents)
organizerRoute.get('/profile',organizerProtect,organizerController.profile)
organizerRoute.post('/updateProfile',organizerProtect,organizerController.updateProfile)
organizerRoute.get('/booked-clients',organizerProtect,organizerController.bookedClients)
organizerRoute.put('/update-payment',organizerProtect,organizerController.updatePaymentStatus)

organizerRoute.get('/getOrganizerConnection',organizerProtect,chatBotController.getOrganizerConnection)
organizerRoute.post('/organizer-sendMessage',organizerProtect,messageController.sendMessage)
organizerRoute.get('/organizer-getMessages/:id',organizerProtect,messageController.getMessages)

module.exports = organizerRoute