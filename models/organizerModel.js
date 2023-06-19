const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')
const organizerSchema = new mongoose.Schema({
    organizerName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    images:{
        type:Array
    },
    district:{
        type:String
    },
    service:{
        type:Array
    },
    event:{
        type:String,
        default:true
    },
    eventId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Events',
        required:true
    },
    venue:{
        type:String,

    },
    description:{
        type:String
    },
    logo:{
        type:String
    },
    budget:{
        type:Number
    },
    bookedEvents:{
        type:Array
    },
    status:{
        type:String,
        default:'pending'
    },
    upcomingEvents:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:'BookedEvents',
    },
    paymentStatus:{
        type:String,
        default:'Advance Only'
    },
    advance:{
        type:Number,
        required:true,
        min:0,
        max:100
    }
    
}, { timestamps: true },);

module.exports = mongoose.model('Organizer',organizerSchema)