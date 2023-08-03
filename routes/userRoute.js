const express = require("express");
const router = express.Router();
const {userAuthentication} = require('../middlewares/userAuth');
const {
  userRegister,
  userLogin,
  isUserAuth,
  forgotPassword,
  googleLogin
} = require('../controllers/userController');
const { userGetAllPost } = require("../controllers/postController");
const {cityDetails} = require('../controllers/cityController');
const {skillDetails} = require('../controllers/skillController');

router.post('/register', userRegister);
router.post('/login', userLogin);
router.post('/googleLogin', googleLogin);
router.get('/userAuth', userAuthentication, isUserAuth);
router.patch('/forgotPass', forgotPassword);
router.get('/getAllPost', userAuthentication, userGetAllPost);
router.get("/cityDetails", userAuthentication, cityDetails);
router.get('/skillData', userAuthentication, skillDetails);




module.exports = router;