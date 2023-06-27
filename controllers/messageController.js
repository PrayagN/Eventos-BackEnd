const message = require('../models/chatModel')
const connections = require('../models/connectionModel')

module.exports ={
    sendMessage:async(req,res,next)=>{
        try {
            console.log(req.body);
            const newMessage = new message(req.body)
            const savedMessage =await newMessage.save()
            res.status(200).json(savedMessage)
        } catch (error) {
            next(error)
        }
    },
    getMessages :async(req,res,next)=>{
        try {

            const messages =await message.find({connection_id:req.params.id}).populate('connection_id')
            console.log(messages);
            res.status(200).json(messages)
        } catch (error) {
            next(error)
        }
    },
   
}