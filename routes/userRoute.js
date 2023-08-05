const express = require("express");
const router = express.Router();
const {userAuthentication} = require('../middlewares/userAuth');
const {
  userRegister,
  userLogin,
  isUserAuth,
  forgotPassword,
  googleLogin,
  updateUserAbout
} = require('../controllers/userController');
const { userGetAllPost, singleJobDetails, applyJob } = require("../controllers/postController");
const {cityDetails} = require('../controllers/cityController');
const {skillDetails} = require('../controllers/skillController');
const upload = require('../middlewares/multer');

router.post('/register', userRegister);
router.post('/login', userLogin);
router.post('/googleLogin', googleLogin);
router.get('/userAuth', userAuthentication, isUserAuth);
router.patch('/forgotPass', forgotPassword);
router.get('/getAllPost', userAuthentication, userGetAllPost);
router.get("/cityDetails", userAuthentication, cityDetails);
router.get('/skillData', userAuthentication, skillDetails);
router.get('/jobDetailedView/:id', userAuthentication, singleJobDetails);
router.post('/applyJob', userAuthentication, upload.single('resume'), applyJob);
router.post('/updateUserAbout', userAuthentication, updateUserAbout);



module.exports = router;