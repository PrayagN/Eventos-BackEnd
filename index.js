require("dotenv").config();
const mongoose =  require("mongoose");
mongoose.set('strictQuery',false)
const CORS = require("cors");
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
// Importing route files
const adminRoute = require("./routes/adminRoute");
const userRoute = require("./routes/userRoute");
const organizerRoute = require("./routes/organizerRoute");

//connect socket
const socket = require("socket.io");

// Connect to MongoDB
const dbConnect = require("./config/config");
dbConnect();

// Middleware
app.use(cookieParser());
app.use(
  CORS({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT"],
    allowedHeaders: ["Content-Type,Authorization"],
  })
);
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/public/eventsPhotos",
  express.static(path.join(__dirname, "public/eventsPhotos"))
);
// Routes
app.use("/", userRoute);
app.use("/admin", adminRoute);
app.use("/organizer", organizerRoute);
app.use((err, req, res, next) => {
  console.error(err.stack);
});


// Start the server
const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const io = socket(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

global.onlineUsers = new Map()


io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
      onlineUsers.set(userId, socket.id)
    })
  
    socket.on("send-msg", (data) => {
      const sendUserSocket = onlineUsers.get(data.receiverId)
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-receive", data)
      }
    })
  })