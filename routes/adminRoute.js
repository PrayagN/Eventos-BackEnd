const express = require('express');
const path = require('path');
const adminRoute = express.Router();
const adminController = require('../controllers/adminController');
const { adminProtect } = require('../middleware/Auth');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/eventsPhotos'));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage: storage });
adminRoute.get('/isAdminAuth', adminProtect, adminController.adminAuth);
adminRoute.post('/signin', adminController.postSignin);
adminRoute.post('/addEvents', adminProtect, upload.single('image'), adminController.addEvents);
adminRoute.get('/events',adminProtect,adminController.loadEvents)

module.exports = adminRoute;
