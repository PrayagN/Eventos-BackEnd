const mongoose = require('mongoose')
const eventSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    date:{
        type:String,
        default:Date.now()
    }
})
module.exports = mongoose.model('Events',eventSchema)