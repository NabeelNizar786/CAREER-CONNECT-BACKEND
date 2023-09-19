const empModel = require("../model/empModel");
const sha256 = require("js-sha256");
const jwt = require("jsonwebtoken");
require('dotenv').config()
const {uploadToCloudinary,
removeFromCloudinary} = require('../config/cloudinary');
const userModel = require('../model/userModel');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const BASE_URL = process.env.BASE_URL
console.log(BASE_URL);
const PREMIUM_PRICE_INR = 1000 * 100;
const {v4: uuidv4} = require("uuid");
const subscriptionModel = require("../model/subscriptionModel");

const empRegister = async (req, res) => {
  try {
    const { companyName, email, phone, password } = req.body;
    console.log(req.body);

    const exists = await empModel.findOne({ email: email });
    if (exists) {
      return res
        .status(200)
        .json({ exists: true, message: "EMAIL ALREADY EXISTS" });
    }

    const newEmp = new empModel({
      companyName: companyName,
      email: email,
      phone: phone,
      password: sha256(password + process.env.PASSWORD_SALT),
    });

    await newEmp.save();
    res
      .status(200)
      .json({
        message: "REGISTRATION SUCCESSFULL, YOU CAN LOGIN AFTER VERIFICATION",
        created: true,
      });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message, created: false });
  }
};

const empLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const empData = await empModel.findOne({ email: email });
    console.log("vanno1");
    if (!empData) {
      return res.status(404).json({ message: "invalid email", login: false });
    }

    const isMatch = await empModel.findOne({
      email: email,
      password: sha256(password + process.env.PASSWORD_SALT),
    });
    // console.log(isMatch);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "invalid passowrd", login: false });
    } else if (!empData.verified) {
      return res
        .status(401)
        .json({ message: "YOUR ACCOUNT IS UNDER VERIFICATION, PLEASE WAIT!" });
    } else if (!empData.status) {
      return res
        .status(401)
        .json({ message: "YOUR ACCOUNT IS BLOCKED!", login: false });
    } else {
      const token = jwt.sign({ id: empData._id }, process.env.JWT_SECRET, {
        expiresIn: 300000,
      });
      res
        .status(200)
        .json({ login: true, message: "login successful", empData:empData, token });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message, login: false });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { email, id } = req.body;
    const empData = await empModel.findOne({ email: email });

    if (!empData) {
      return res.status(404).json({ message: "INVALID EMAIL", login: false });
    } else {
      const token = jwt.sign({ id: empData._id }, process.env.JWT_SECRET, {
        expiresIn: 300000,
      });
      res.status(200).json({
        login: true,
        message: "LOGIN SUCCESSFUL",
        token: token,
        empData,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message, login: false });
  }
};

const isEmpAuth = async (req, res) => {
  try {
    const empData = await empModel.findOne({ _id: req.empId });

    if (!empData) {
      return res
        .status(404)
        .json({ message: "USER DOES NOT EXISTS", success: false });
    } else {
      return res.status(200).json({ success: true, empData: empData });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { phone, password, check } = req.body;
    console.log(phone, password);

    if (check === "yes") {
      const phoneMatch = await empModel.findOne({ phone });

      if (!phoneMatch)
        return res.status(400).json({ message: "USER NOT FOUND" });

      return res.status(200).json({ message: "USER FOUND" });
    }

    const user = await empModel.findOne({ phone });
    user.password = sha256(password + process.env.PASSWORD_SALT);

    await user.save();

    return res
      .status(200)
      .json({ message: "PASSWORD SUCCESSFULLY CHANGED!", success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false });
  }
};

const updateAbout = async(req,res) => {
  try {
    const {about} = req.body;
    let empId = req.empId;

    const empData = await empModel.findOneAndUpdate(
      {_id: empId},
      {$set:{about:about}},
      {new: true}
    );

    if(empData) {
      return res
        .status(200)
        .json({ success: true, message: "UPDATED", empData });
    }
    return res
      .status(404)
      .json({ success: false, message: "SOMETHING WENT WRONG!!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "SERVER ERROR" });
  }
}

const updateBasicInfo = async(req,res) => {
  try {
    const {Location, Phone, name} = req.body;
    const empId = req.empId;

    const empData = await empModel.findOneAndUpdate(
      { _id: empId },
      { $set: { location: Location, phone: Phone, companyName: name } },
      { new: true }
    );

    console.log(empData);

    if(!empData) {
      return res
        .status(404)
        .json({ success: false, message: "SOMETHING WENT WRONG!!" });
    }
    console.log(empData, "new");
    return res.status(200).json({ success: true, message: "UPDATED", empData });
  } catch (error) {
    return res.status(500).json({ success: false, error: "SERVER ERROR" });
  }
}

const changeImg = async(req,res) => {
  try {
    const empId = req.empId;
    const image = req.file.path;

    let emp = await empModel.findOne({_id:empId});

    if(emp.imageId) {
      const responseData = await removeFromCloudinary(emp.imageId);
    }

    const data = await uploadToCloudinary(image, 'profilePictures');

    if(data) {
      const empData = await empModel.findOneAndUpdate(
        {_id:empId},
        {$set:{image: data.url, imageId: data.public_id}},
        {new: true}
      );
      return res.status(200).json({success:true, empData})
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: "SERVER ERROR" });
  }
}

const getUserData = async(req,res) => {
  try {
    let userId = req.params.userId;

    const userData = await userModel.findOne({ _id: userId });
    if (userData) {
      return res
        .status(200)
        .json({ login: true, message: "login successful", userData });
    } else {
      return res
        .status(404)
        .json({ message: "userData not found", success: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message, success: false });
  }
}

const empUserSearch = async (req, res) => {
  try {
    const { skill } = req.query;
    console.log(skill);
    const skillUpperCase = skill.toUpperCase();
    console.log(skillUpperCase);
    if (!skillUpperCase || skillUpperCase.trim() === "") {
      // If skill is not provided or empty, return all users
      const userData = await userModel.find({});
      if (userData) {
        return res.status(200).json({ success: true, userData });
      } else {
        return res.status(404).json({ success: true, userData: [] });
      }
    } else {
      // If a skill is provided, search for users with that skill
      const userData = await userModel.find({ skills: { $in: [skillUpperCase] } });
      if (userData) {
        console.log(userData);
        return res.status(200).json({ success: true, userData });
      } else {
        return res.status(200).json({ success: true, userData: [] });
      }
    }
  } catch (error) {
    // Handle error
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};


const premium = async(req,res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "JobMatch Premium",
            },
            unit_amount: PREMIUM_PRICE_INR,
          },
          quantity: 1,
        },
      ],
      success_url: `${BASE_URL}/employer/paymentSuccess/${req.empId}`,
      cancel_url: `${BASE_URL}/employer/subscription`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong." });
  }
}

const updatePremium = async(req,res) => {
  try {
    const {empId} = req.params;
    const empData = await empModel.findOneAndUpdate(
      {_id:empId},
      {$set: {isPremium: true}},
      {new: true}
    );

    if (!empData) {
      return res.status(404).json({ message: "Employer data not found" });
    }

    const orderId = uuidv4();
    const subscription = new subscriptionModel({
      empId: empId,
      amount: 1000,
      pack: "premium",
      paymentMethod: "CreditCard",
      orderId: orderId,
    });

    const savedSubscription = await subscription.save();

    if(savedSubscription) {
      return res.status(200).json({ empData });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error });
  }
}

module.exports = {
  empRegister,
  empLogin,
  isEmpAuth,
  forgotPassword,
  googleLogin,
  updateAbout,
  updateBasicInfo,
  changeImg,
  getUserData,
  premium,
  updatePremium,
  empUserSearch
};
