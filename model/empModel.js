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
  },
  status: {
    type: Boolean,
    default: true
  },
  imageId: {
    type:String,
  },
  about: {
    type:String
  },
  phone: {
    type:String
  },
  location: {
    type:String
  },
  postCount: {
    type: Number,
    default: 0,
  },
},
{timestamps: true}
)

const empModel = mongoose.model("employers", empSchema);

module.exports = empModel;