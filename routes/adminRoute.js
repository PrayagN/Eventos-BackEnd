const express = require('express')
const adminRoute = express()
const adminController = require('../controllers/adminController')

adminRoute.post('/signin',adminController.postSignin)


module.exports = adminRoute;