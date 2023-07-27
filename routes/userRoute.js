const express = require("express");
const router = express.Router();
const {userAuthentication} = require('../middlewares/userAuth');
const {
  userRegister,
  userLogin,
  isUserAuth,
  forgotPassword
} = require('../controllers/userController');

router.post('/register', userRegister);
router.post('/login', userLogin);
router.get('/userAuth', userAuthentication, isUserAuth);
router.patch('/forgotPass', forgotPassword)



module.exports = router;