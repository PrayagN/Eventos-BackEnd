const mongoose = require('mongoose');

const BookedEventsSchema = new  mongoose.Schema({
    totalAmount:{
        type:Number,
        required:true
    },
    advanceAmount:{
        type:Number,
        required:true
    },
    client:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    organizer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Organizer',
        required:true
    },
    eventScheduled:{
        type:Date,
        required:true
    },
    bookedDate:{
        type:Date,
        required:true
    }

},{timestamps:true})

module.exports =mongoose.model('BookedEvents',BookedEventsSchema)