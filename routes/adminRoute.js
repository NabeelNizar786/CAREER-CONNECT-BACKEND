const express = require('express');
const router = express.Router();
const {adminAuthentication} = require('../middlewares/adminAuth');
const {adminLogin, adminAuth, userDetails, empDetails, empVerify, verified} = require('../controllers/adminController');
const { skillDetails, addSkill } = require('../controllers/skillController');
const { addCity, cityDetails } = require('../controllers/cityController');

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


module.exports = router;