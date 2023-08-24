const express = require('express');
const router = express.Router();
const {
  empRegister,
  empLogin,
  isEmpAuth,
  forgotPassword,
  googleLogin,
  updateAbout,
  updateBasicInfo,
  changeImg,
  getUserData,
  premium,
  updatePremium,
  empUserSearch
} = require('../controllers/empController');

const {empAuthentication} = require('../middlewares/empAuth');
const { createPost, getPostData, getActivePostData, getSinglePostData, changeApplicationStatus, editPost } = require('../controllers/postController');
const { skillDetails } = require('../controllers/skillController');
const { cityDetails } = require('../controllers/cityController');
const upload = require('../middlewares/multer');

router.post('/register', empRegister);
router.post('/login', empLogin);
router.post('/googleLogin', googleLogin);
router.get('/empAuth', empAuthentication, isEmpAuth);
router.patch('/forgotPass', forgotPassword);
router.post('/createPost', empAuthentication, createPost);
router.post("/editPost/:id", empAuthentication, editPost);
router.get('/getPostData', empAuthentication, getPostData);
router.get('/skillData', empAuthentication, skillDetails);
router.get('/cityData',empAuthentication, cityDetails);
router.get('/getPostData', empAuthentication, getPostData);
router.get('/getActivePostData', empAuthentication, getActivePostData);
router.post('/updateAbout', empAuthentication, updateAbout);
router.post('/updateBasicInfo', empAuthentication, updateBasicInfo);
router.post('/changeImage', empAuthentication, upload.single('image'), changeImg);
router.get('/getPostData', empAuthentication, getPostData);
router.get('/getSinglePostData/:postId', empAuthentication, getSinglePostData );
router.post('/changeApplicationStatus/:postId/:applicationId/:newStatus/:userId',
empAuthentication,
changeApplicationStatus
);
router.post('/empSearchUser', empAuthentication, empUserSearch)

//payment
router.post('/subscription', empAuthentication, premium);
router.post('/verifyPayment/:empId', empAuthentication, updatePremium);

module.exports = router;