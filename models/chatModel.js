const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
    senderId:{
        type :mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
        
    },
    receiverId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Organizer'
    },
    content:{
        type:String,
        required:true
    },
    timestamp:{
        type:Date,
        default:Date.now()
    }
},{timestamps:true})
module.exports = mongoose.model('Chat',chatSchema)