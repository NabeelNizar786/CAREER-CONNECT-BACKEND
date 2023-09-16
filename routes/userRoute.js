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
  userStatus,
  userGetEmpDetails,

} = require('../controllers/userController');
const { userGetAllPost, singleJobDetails, applyJob, InvitedJobs, userApplications } = require("../controllers/postController");
const {cityDetails} = require('../controllers/cityController');
const {skillDetails} = require('../controllers/skillController');
const upload = require('../middlewares/multer');
const { createChat, userChat, findChat } = require("../controllers/chatController");
const { addMessage, getMessages } = require("../controllers/messageController");

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
router.post("/userGetEmpDetails/:empId", userAuthentication, userGetEmpDetails);
router.get("/invitedjobs", userAuthentication, InvitedJobs);
router.get(
  "/getUserApplications/:status",
  userAuthentication,
  userApplications
);

//chatRoutes

router.post("/createChat", createChat);
router.get("/getChat/:userId", userChat);
router.get("/findChat/:firstId/:secondId", findChat);

//messages

router.post("/addMessage", addMessage);
router.get("/getMessages/:chatId", getMessages);




module.exports = router;