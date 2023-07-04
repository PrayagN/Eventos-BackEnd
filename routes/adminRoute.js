const express = require('express');
const path = require('path');
const adminRoute = express.Router();
const adminController = require('../controllers/adminController');
const { adminProtect } = require('../middleware/Auth');
const upload =require('../middleware/multer')

adminRoute.get('/isAdminAuth',adminProtect, adminController.adminAuth);
adminRoute.post('/signin', adminController.postSignin);

adminRoute.get('/loadDashboard',adminProtect,adminController.loadDashboard)
adminRoute.post('/addEvents', adminProtect, upload, adminController.addEvents);
adminRoute.get('/events',adminProtect,adminController.loadEvents)

adminRoute.get('/listOrganizers',adminProtect,adminController.listOrganizers)
adminRoute.post('/viewOrganizer/',adminProtect,adminController.viewOrganizer)
adminRoute.post('/acceptOrganizer',adminProtect,adminController.acceptOrganizer)

adminRoute.get('/listCustomers',adminProtect,adminController.listCustomers)
adminRoute.get('/bookedEventsData',adminProtect,adminController.bookedEventsData)
module.exports = adminRoute;
