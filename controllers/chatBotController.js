require("dotenv").config();

const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Organizer = require("../models/organizerModel");
const Connections = require("../models/connectionModel");

module.exports = {
  chatConnection: async (req, res, next) => {
    try {
      
      const organizer_id = req.body.id;
      const user_id = req.decoded.id;

    const existingConnection = await Connections.findOne({
      "members.client": user_id,
      "members.organizer": organizer_id,
    });
    if(existingConnection){
      res.status(200).json({existingConnection,status :true})
    }else{
      const newConnection =await Connections.create({
        members:{
          client:user_id,
          organizer:organizer_id
        }
      })
      res.status(200).json({newConnection,status:true})
    }
  } catch (error) {
      next(error)
  }
  },
};
