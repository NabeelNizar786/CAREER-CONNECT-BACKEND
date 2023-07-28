const userModel = require("../model/userModel");
const empModel = require("../model/empModel");
const sha256 = require("js-sha256");
const jwt = require("jsonwebtoken");
const tokenModel = require("../model/token");
const crypto = require("crypto");
const { log } = require("console");

const userRegister = async (req, res) => {
  try {
    let { username, email, password, phone } = req.body;

    const exists = await userModel.findOne({ email: email });

    if (exists) {
      return res
        .status(200)
        .json({ exists: true, message: "email already exists" });
    }

    const newUser = new userModel({
      username: username,
      email: email,
      phone: phone,
      password: sha256(password + process.env.PASSWORD_SALT),
    });

    await newUser.save();
    res
      .status(200)
      .json({ message: "REGISTRATION SUCCESSFULL", created: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message, created: false });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await userModel.findOne({ email: email });

    if (!userData) {
      return res.status(404).json({ message: "invalid email", login: false });
    }

    const isMatch = await userModel.findOne({
      email: email,
      password: sha256(password + process.env.PASSWORD_SALT),
    });
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "invalid passowrd", login: false });
    } else {
      const token = jwt.sign({ id: userData._id }, process.env.JWT_SECRET, {
        expiresIn: 3000000,
      });
      res.status(200).json({
        login: true,
        message: "login successful",
        token: token,
        userData,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message, login: false });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { email,id } = req.body;
    const userData = await userModel.findOne({ email: email });

    console.log(userData.email);
    console.log(email);
    if (!userData) {
      return res.status(404).json({ message: "INVALID EMAIL", login: false });
    } else {
      const token = jwt.sign({ id: userData._id }, process.env.JWT_SECRET, {
        expiresIn: 300000,
      });
      res.status(200).json({
        login: true,
        message: "LOGIN SUCCESSFUL",
        token: token,
        userData,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message, login: false });
  }
};

const isUserAuth = async (req, res) => {
  try {
    const userData = await userModel.findOne({ _id: req.userId });

    if (!userData) {
      return res
        .status(404)
        .json({ message: "USER DOES NOT EXISTS", success: false });
    } else {
      return res.status(200).json({ success: true, userData: userData });
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
      const phoneMatch = await userModel.findOne({ phone });

      if (!phoneMatch)
        return res.status(400).json({ message: "USER NOT FOUND" });

      return res.status(200).json({ message: "USER FOUND" });
    }

    const user = await userModel.findOne({ phone });
    user.password = sha256(password + process.env.PASSWORD_SALT);

    await user.save();

    return res.status(200);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false });
  }
};

module.exports = {
  userRegister,
  userLogin,
  isUserAuth,
  forgotPassword,
  googleLogin
};
