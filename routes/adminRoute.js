const express = require('express')
const adminRoute = express()
const adminController = require('../controllers/adminController')
const {adminProtect} = require('../middleware/Auth')

adminRoute.get('/isAdminAuth',adminProtect,adminController.adminAuth)
adminRoute.post('/signin',adminController.postSignin)


module.exports = adminRoute;