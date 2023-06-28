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
      if (existingConnection) {
        res.status(200).json({ existingConnection, status: true });
      } else {
        const newConnection = await Connections.create({
          members: {
            client: user_id,
            organizer: organizer_id,
          },
        });
        res.status(200).json({ newConnection, status: true });
      }
    } catch (error) {
      next(error);
    }
  },
  getConnections: async (req, res, next) => {
    try {
      const user_id = req.decoded.id;
       await Connections.find({ "members.client": user_id })
        .sort({ updatedAt: -1 })
        .populate({
          path: "members.organizer",
          select: "organizerName logo",
          model: "Organizer",
        }).populate('lastMessage').then((response)=>{
        console.log(response);
          res.status(200).json({connections:response,status:true})
        }).catch((error)=>{
          res.status(500).json({message:'internal error occurred'})
        })
    } catch (error) {
      next(error);
    }
  },
  getOrganizerConnection :async(req,res,next)=>{
    try {
      const organizer_Id = req.organizer_Id
      await Connections.find({'members.organizer':organizer_Id}).sort({updatedAt:-1}).populate({path:'members.client',select:'username image',model:'User'}).then((response)=>{
        res.status(200).json({connections:response,status:true})
      }).catch((error)=>{
        res.status(500).json({message:'internal error occurred'})
      })
    } catch (error) {
      next(error)
    }
  }
};
