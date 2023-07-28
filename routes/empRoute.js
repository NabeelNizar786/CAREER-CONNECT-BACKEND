const express = require('express');
const router = express.Router();
const {
  empRegister,
  empLogin,
  isEmpAuth,
  forgotPassword,
  googleLogin
} = require('../controllers/empController');

const {empAuthentication} = require('../middlewares/empAuth');

router.post('/register', empRegister);
router.post('/login', empLogin);
router.post('/googleLogin', googleLogin);
router.get('/empAuth', empAuthentication, isEmpAuth);
router.patch('/forgotPass', forgotPassword);


module.exports = router;