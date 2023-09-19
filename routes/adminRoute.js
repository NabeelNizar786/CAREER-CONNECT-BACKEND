const express = require('express');
const router = express.Router();
const {adminAuthentication} = require('../middlewares/adminAuth');
const {adminLogin, adminAuth, userDetails, empDetails, empVerify, verified, changeUserStatus, changeEmpStatus, adminGetSubscriptionDetails, revenue, userCount, empCount, getPostsByDate, employersByDate} = require('../controllers/adminController');
const { skillDetails, addSkill, dropSkill } = require('../controllers/skillController');
const { addCity, cityDetails, dropCity } = require('../controllers/cityController');

router.post('/adminLogin', adminLogin);
router.get('/adminAuth', adminAuthentication, adminAuth);
router.get('/userDetails', adminAuthentication, userDetails);
router.get('/empDetails', adminAuthentication, empDetails);
router.get('/empVerify', adminAuthentication, empVerify);
router.patch('/verify', adminAuthentication, verified);
router.get("/skillDetails", adminAuthentication, skillDetails);
router.post("/addskill", adminAuthentication, addSkill);
router.post("/addcity", adminAuthentication, addCity);
router.get("/cityDetails", adminAuthentication, cityDetails);
router.post('/changeUserStatus', adminAuthentication, changeUserStatus);
router.post('/changeEmpStatus', adminAuthentication, changeEmpStatus);
router.get("/subscriptiondetails",adminAuthentication,adminGetSubscriptionDetails);
router.post('/dropSkill', adminAuthentication, dropSkill);
router.post('/dropCity', adminAuthentication, dropCity);
router.get("/revenue", adminAuthentication, revenue);
router.get("/usercount", adminAuthentication, userCount);
router.get("/empcount", adminAuthentication, empCount);
router.get("/postsByDate", adminAuthentication, getPostsByDate);
router.get("/countByDate", adminAuthentication, employersByDate);


module.exports = router;