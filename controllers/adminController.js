const adminModel = require("../model/adminModel");
const userModel = require("../model/userModel");
const empModel = require("../model/empModel");
const jwt = require("jsonwebtoken");
const sendMail = require('../utils/nodeMailer');

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminData = await adminModel.findOne({ email: "admin@example.com" });

    if (!adminData) {
      return res.status(404).json({ message: "INVALID EMAIL", login: false });
    }

    if (password !== adminData.password) {
      return res
        .status(401)
        .json({ message: "INVALID PASSWORD", login: false });
    }

    const token = jwt.sign({ id: adminData._id }, process.env.JWT_SECRET, {
      expiresIn: 300000,
    });
    res
      .status(200)
      .json({ login: true, message: "login successfull", token: token });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message, login: false });
  }
};

const userDetails = async (req, res) => {
  try {
    const userData = await userModel.find({});

    if (userData) {
      res.status(200).json({ data: true, message: "successfull", userData });
    } else {
      res.status(400).json({ error: error.message, message: "data not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message, login: false });

    console.log(error.message);
  }
};

const empDetails = async (req, res) => {
  try {
    const empData = await empModel.find({});
    console.log(empData);
    if (empData) {
      res.status(200).json({ data: true, message: "SUCCESSFULL", empData });
    } else {
      res.status(400).json({ error: error.message, login: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message, login: false });

    console.log(error.message);
  }
};

const empVerify = async(req,res)  => {
  try {
    const empData = await empModel.find({verified:false});
    if(empData) {

      res.status(200).json({empData:empData})
    } else {

      res.status(201).json({message:"NO USERS"});
    }
  } catch (error) {
    
  }
}

const verified = async(req,res) => {
  try {
    const {email} = req.body;

    console.log(email);
    const verifyEmp = await empModel.updateOne(
      {email:email},
      {$set:{verified: true}}
    );
    await sendMail(email,"YOUR ACCOUNT VERIFIACTION IS SUCCESSFULL!");

    if(verifyEmp){
      const empData = await empModel.find({verified:false});
      if(empData) {
        res.status(200).json({ message: "updated", empData });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false });
  }
}



const adminAuth = async (req, res) => {
  try {
    const adminData = await adminModel.findOne({ _id: req.adminId });

    if (!adminData) {
      return res
        .status(404)
        .json({ message: "authentication failed", success: false });
    } else {
      return res.status(200).json({ success: true, adminData: adminData });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false });
  }
};

module.exports = {
  adminLogin,
  adminAuth,
  userDetails,
  empDetails,
  empVerify,
  verified
};
