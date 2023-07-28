const empModel = require("../model/empModel");
const sha256 = require("js-sha256");
const jwt = require("jsonwebtoken");

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
      .json({ message: "REGISTRATION SUCCESSFULL", created: true });
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
    } else {
      const token = jwt.sign({ id: empData._id }, process.env.JWT_SECRET, {
        expiresIn: 300000,
      });
      res
        .status(200)
        .json({ login: true, message: "login successful", empData, token });
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

    return res.status(200).json({message: "PASSWORD SUCCESSFULLY CHANGED!", success:true});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false });
  }
};

module.exports = {
  empRegister,
  empLogin,
  isEmpAuth,
  forgotPassword,
};
