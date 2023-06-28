const { ObjectId } = require('mongodb')
const mongoose = require('mongoose' )

const connectionSchema = new mongoose.Schema({
    members:{
        client:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        organizer:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Organizer',
            required:true
        }
    },
    lastMessage:{
        type:ObjectId,
        ref:'Chat',
        // default:null
    }

},{timestamps:true})
module.exports = mongoose.model('Connections',connectionSchema)