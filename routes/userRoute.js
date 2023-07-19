const express = require("express");
const router = express.Router();
const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/signup", async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res
        .status(200)
        .send({ message: "USER ALREADY EXISTS", success: false });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newuser = new User({
      username:req.body.username,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword
    });
    await newuser.save();
    res.status(200).send({ message: "USER CREATED SUCCESSFULLY" , success: true });
  } catch (error) {
    console.log(error)
    res.status(500).send({ message: "ERROR CREATING USER", success: false });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if(!user) {
      return res
      .status(200)
      .send({message: "USER DOES NOT EXIST", success: false});
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if(!isMatch) {
      return res
      .status(200)
      .send({message: "PASSWORD IS INCORRECT", success: false});
    } else {
      const token = jwt.sign({id:user._id}, process.env.JWT_SECRET, {
        expiresIn: "1d"
      });
      res.status(200).send({message: "LOGIN SUCCESSFULL", success: true, data:token});
    }
  } catch (error) {
    res
    .status(500)
    .send({message: "ERROR LOGGING IN", success: false, error});
  }
});

// router.post('/get-user-info-by-id', authMiddleware, async (req,res) => {
//   try {
//     const user = await User.findOne({_id: req.body.userId})
//     if(!user) {
//       return res
//       .status(200)
//       .send({message:"USER DOES NOT EXIST", success:false});
//     } else {
//       res.status(200).send({ success: true, data: {
//         name: user.name,
//         email: user.email,
//       } })
//     }
//   } catch (error) {
//     res
//     .status(500)
//     .send({ message:"ERROR GETTING USER INFO", success: false, error });
//   }
// });

module.exports = router;
