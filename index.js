const CORS = require("cors");
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require('path')
// Importing route files
const adminRoute = require("./routes/adminRoute");
const userRoute = require("./routes/userRoute");
const organizerRoute = require("./routes/organizerRoute");


// Connect to MongoDB
const dbConnect =require('./config/config')
const env =require('dotenv').config();
dbConnect()


// Middleware
app.use(cookieParser());
app.use(
    CORS({
        origin: 'http://localhost:5173',
        credentials: true,
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type,Authorization"],
    })
);
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')))
app.use('/public/eventsPhotos', express.static(path.join(__dirname, 'public/eventsPhotos')));
// Routes
app.use('/', userRoute);
app.use('/admin', adminRoute);
app.use('/organizer', organizerRoute);

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
