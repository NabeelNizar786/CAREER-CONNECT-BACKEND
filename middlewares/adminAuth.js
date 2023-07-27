const jwt = require('jsonwebtoken');

module.exports.adminAuthentication = async(req,res,next) => {
  try {
    console.log(req.headers);
    const token = req.headers["authorization"].split(" ")[1]

    jwt.verify(token, process.env.JWT_SECRET,(err,decoded)=>{
      if(err){
        return res
        .status(200)
        .send({message:"Auth failed", success:false})
      } else {
        req.adminId = decoded.id
        next()
      }
    })
  } catch (error) {
    console.log(error);
    return res
    .status(401)
    .send({message: "Auth failed", success: false})
  }
}