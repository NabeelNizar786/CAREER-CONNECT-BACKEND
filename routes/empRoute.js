const express = require('express');
const router = express.Router();
const Employer = require('../model/empModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/empRegister', async (req,res) => {
  try {
    const empExists = await Employer.findOne({ email: req.body.email });
    if(empExists){
      return res
      .status(200)
      .send({ message:"EMPLOYER ALREADY EXISTS", success:false });
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newemp = new Employer ({
      companyName: req.body.companyName,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword
    });
    await newemp.save()
    res
    .status(200)
    .send({ message:"EMPLOYER CREATED SUCCESSFULLY", success: true });
  } catch (error) {
    console.log(error);
    res
    .status(500)
    .send({ message:"ERROR CREATING EMPLOYER", success: false });
  }
});

router.post('/empLogin', async (req,res) => {
  try {
    const employer = await Employer.findOne({ email:req.body.email });
    if(!employer) {
      return res
      .status(200)
      .send({ message:"EMPLOYER DOES NOT EXIST", success: false })
    }
    const isMatch = await bcrypt.compare(req.body.password, employer.password);
    if(!isMatch) {
      return res
      .status(200)
      .send({ message:"PASSWORD IS INCORRECT", success: false })
    } else {
      const token = jwt.sign({id:employer._id}, process.env.JWT_SECRET, {
        expiresIn: "1d"
      });
      res
      .status(200)
      .send({ message:"LOGIN SUCCESSFULL", success:true, data:token })
    }
  } catch (error) {
    res
    .status(500)
    .send({ message: "ERROR LOGGING IN", success, error })
  }
});

module.exports = router;