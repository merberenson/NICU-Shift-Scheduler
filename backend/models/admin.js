const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    adminID : { 
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name : {
        type: String,
        required: true
    },
    username : {
        type: String,
        required: true
    },
    password : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true
    },
    phone : {
        type: Number,
        required: true
    }
})