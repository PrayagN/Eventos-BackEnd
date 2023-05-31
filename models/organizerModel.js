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
    photos:{
        type:String
    },
    district:{
        type:String
    },
    state:{
        type:String
    },
    services:{
        type:Array
    }


    

})

module.exports = mongoose.model('Organizer',organizerSchema)