const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({

    reviewedBy:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true
    }
})