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
    state:{
        type:String
    },
    service:{
        type:Array
    },
    event:{
        type:String,
        default:true
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
    }


    

}, { timestamps: true },);

module.exports = mongoose.model('Organizer',organizerSchema)