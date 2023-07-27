const adminModel = require('../model/adminModel');
const jwt = require('jsonwebtoken');

const adminLogin = async(req,res) => {
  try {
    const {email,password} = req.body
    const adminData = await adminModel.findOne({email:"admin@example.com"});

    if(!adminData){
      return res
      .status(404)
      .json({message:"INVALID EMAIL", login:false})
    }

    if(password !== adminData.password){
      return res
      .status(401)
      .json({message:"INVALID PASSWORD", login:false})
    }

    const token = jwt.sign({id:adminData._id},process.env.JWT_SECRET,{expiresIn:300000})
    res
    .status(200)
    .json({login:true, message:"login successfull", token:token})
  } catch (error) {
    console.log(error.message);
    res
    .status(500)
    .json({error: error.message, login:false})
  }
}

const adminAuth = async(req,res) => {
  try {
    const adminData = await adminModel.findOne({_id:req.adminId})

    if(!adminData){
      return res.status(404).json({message:"authentication failed",success:false})
    } else {
      return res.status(200).json({success:true,adminData:adminData});
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false });
  }
}

module.exports = {
  adminLogin,
  adminAuth
}