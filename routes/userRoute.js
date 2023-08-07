const express = require("express");
const router = express.Router();
const {userAuthentication} = require('../middlewares/userAuth');
const {
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
router.post('/updateUserBasicInfo', userAuthentication, updateUserBasicInfo);
router.post('/addUserExp', userAuthentication, addUserExp);
router.post("/addUserSkill", userAuthentication, addUserSkill);
router.post("/dropUserSkill", userAuthentication, dropUserSkill);
router.post("/addUserEdu", userAuthentication, addUserEdu);
router.post("/dropUserExp", userAuthentication, dropUserExp);
router.post("/dropUserEdu", userAuthentication, dropUserEdu);
router.post('/changeUserPassword', userAuthentication, changePassword);
router.post('/changeUserImage', userAuthentication, upload.single('image'), changeUserImg);




module.exports = router;