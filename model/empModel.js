const mongoose = require('mongoose');

const empSchema = new mongoose.Schema({

  companyName: {
    type:String,
    required: true
  },
  email:{
    type:String,
    required:true
  },
  phone: {
    type:Number,
    required: true
  },
  password:{
    type:String,
    required:true
  },
  verified:{
    type:Boolean,
    default:false,
  },
  image:{
    type:String
  }

})

const empModel = mongoose.model("employers", empSchema);

module.exports = empModel;