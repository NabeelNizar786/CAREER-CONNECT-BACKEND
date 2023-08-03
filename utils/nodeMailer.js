const nodemailer = require('nodemailer');
require('dotenv').config();

module.exports=async(email,subject,text)=>{
  try {
  
      const transporter = nodemailer.createTransport({
          host:process.env.HOST,
          service:process.env.SERVICE,
          port:Number(process.env.EMAIL_PORT),
          secure:false,
          auth:{
              user:process.env.USER,
              pass:process.env.PASS
          }
      });
      // console.log(tr);
      await transporter.sendMail({
          from:process.env.USER,
          to:email,
          subject:subject,
          text:"YOUR CAREER CONNECT EMPLOYEE ACCOUNT VERIFICATION IS SUCCESSFULL!"
      })
      console.log("email sent successfully");
  } catch (error) {
      console.log("emailnot sented");
      console.log(error);
  }
}