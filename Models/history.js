const mongoose = require("mongoose");
// const { ticketStatus } = require("../utils/constants");

const historySchema = new mongoose.Schema({

    remarks:{
        type:String,
        required:true
    },
    userId:{
        type:String,
        required:true
    },
    ticketId:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        immutable:true,
        default:()=>Date.now()
    }
})

module.exports = mongoose.model("History", historySchema,"history");