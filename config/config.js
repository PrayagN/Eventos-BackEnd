const mongoose = require("mongoose");
require('dotenv').config();

const dbConnect = async () => {
 try {
  mongoose.connect(process.env.MONGODB_IP).then(()=>{
    console.log('databse connected');
  }).catch((err)=>{
    console.log(err);
  })
 } catch (error) {
  console.log(error);
 }
};

module.exports = dbConnect;
