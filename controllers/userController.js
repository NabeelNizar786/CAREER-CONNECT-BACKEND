const userModel = require("../model/userModel");
const empModel = require("../model/empModel");
const sha256 = require("js-sha256");
const jwt = require("jsonwebtoken");
const tokenModel = require("../model/token");
const crypto = require("crypto");
const { log } = require("console");
const {
  uploadToCloudinary,
  removeFromCloudinary,
} = require("../config/cloudinary");

const userRegister = async (req, res) => {
  try {
    let { username, email, password, currentPassword, phone } = req.body;
    console.log(username, email, password, currentPassword, phone);
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
    } else if (!userData.status) {
      return res
        .status(401)
        .json({ message: "YOUR ACCOUNT IS BLOCKED!", login: false });
    } else {
      const token = jwt.sign(
        { id: userData._id, role: userData.role },
        process.env.JWT_SECRET,
        {
          expiresIn: 3000000,
        }
      );
      res.status(200).json({
        login: true,
        message: "login successful",
        token: token,
        userData: userData,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message, login: false });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { email, id } = req.body;
    const userData = await userModel.findOne({ email: email });

    console.log(userData.email);
    console.log(email);
    if (!userData) {
      return res.status(404).json({ message: "INVALID EMAIL", login: false });
    } else {
      const token = jwt.sign({ id: userData._id, role: userData.role }, process.env.JWT_SECRET, {
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
    const userData = await userModel.findOne({ _id: req.userId }).lean();
    if (!userData) {
      return res
        .status(404)
        .json({ message: "USER DOES NOT EXISTS", success: false });
    } else if (!userData.status) {
      return res
        .status(404)
        .json({ message: "YOUR ACCOUNT IS BLOCKED!", success: false, userData:userData });
    } else {
      delete userData.password;
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

const updateUserAbout = async (req, res) => {
  try {
    const { about } = req.body;
    let userData = await userModel.findByIdAndUpdate(
      { _id: req.userId },
      { $set: { about: about } },
      { new: true }
    );
    return res.status(200).json({ success: true, userData: userData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

const updateUserBasicInfo = async (req, res) => {
  try {
    const { Location, Phone, name } = req.body;

    const userId = req.userId;

    const userData = await userModel.findOneAndUpdate(
      { _id: userId },
      { $set: { location: Location, phone: Phone, name: name } },
      { new: true }
    );

    return res.status(200).json({ success: true, userData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

const addUserExp = async (req, res) => {
  try {
    const { exp, role, company } = req.body;

    let userData = await userModel.findOne({ _id: req.userId });

    const newExp = {
      role: role,
      company: company,
      exp: exp,
    };

    userData.workExp.push(newExp);
    await userData.save();

    return res.status(200).json({ success: true, userData: userData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

const addUserSkill = async (req, res) => {
  try {
    const skill = req.body;

    let userData = await userModel.findOne({ _id: req.userId });
    const newSkills = skill.filter((skill) => !userData.skills.includes(skill));
    userData.skills.push(...skill);
    await userData.save();

    return res.status(200).json({ success: true, userData: userData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

const dropUserSkill = async (req, res) => {
  try {
    let { skill } = req.body;
    const userId = req.userId;

    const userData = await userModel.findOneAndUpdate(
      { _id: userId },
      { $pull: { skills: skill } },
      { new: true }
    );

    return res.status(200).json({ success: true, userData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

const addUserEdu = async (req, res) => {
  try {
    const { course, Institute } = req.body;

    let userData = await userModel.findOne({ _id: req.userId });

    const newEdu = {
      course: course,
      institute: Institute,
    };

    userData.education.push(newEdu);
    await userData.save();

    return res.status(200).json({ success: true, userData: userData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

const dropUserExp = async (req, res) => {
  try {
    let { id } = req.body;
    const userId = req.userId;

    const userData = await userModel.findOneAndUpdate(
      { _id: userId },
      { $pull: { workExp: { _id: id } } },
      { new: true }
    );

    return res.status(200).json({ success: true, userData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

const dropUserEdu = async (req, res) => {
  try {
    let { id } = req.body;
    const userId = req.userId;

    const userData = await userModel.findOneAndUpdate(
      { _id: userId },
      { $pull: { education: { _id: id } } },
      { new: true }
    );

    return res.status(200).json({ success: true, userData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currPass, newPass } = req.body;

    // const userData = await userModel.findOne({_id: req.userId});

    const isMatch = await userModel.findOne({
      password: sha256(currPass + process.env.PASSWORD_SALT),
    });

    if (isMatch) {
      const updatedPass = sha256(newPass + process.env.PASSWORD_SALT);

      await userModel
        .updateOne({ _id: req.userId }, { $set: { password: updatedPass } })
        .then(() => {
          return res
            .status(200)
            .json({ success: true, message: "Password Changed Successfully" });
        });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

const changeUserImg = async (req, res) => {
  try {
    const userId = req.userId;

    const image = req.file.path;
    let user = await userModel.findOne({ _id: userId });
    console.log(user);
    if (user.imageId) {
      const responseData = await removeFromCloudinary(user.imageId);
    }

    const data = await uploadToCloudinary(image, "profilePictures");
    if (data) {
      const userData = await userModel.findOneAndUpdate(
        { _id: userId },
        { $set: { image: data.url, imageId: data.public_id } },
        { new: true }
      );
      return res.status(200).json({ success: true, userData });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error });
  }
};

const userGetEmpDetails = async (req, res) => {
  try {
    let empId = req.params.empId;
    const empData = await empModel.findOne({ _id: empId });
    if (!empData)
      return res
        .status(404)
        .json({ success: false, message: "not data found" });

    return res
      .status(200)
      .json({ success: true, message: "data obtained", empData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

module.exports = {
  userRegister,
  userLogin,
  isUserAuth,
  forgotPassword,
  googleLogin,
  updateUserAbout,
  updateUserBasicInfo,
  addUserExp,
  addUserSkill,
  dropUserSkill,
  addUserEdu,
  dropUserExp,
  dropUserEdu,
  changePassword,
  changeUserImg,
  userGetEmpDetails
};
