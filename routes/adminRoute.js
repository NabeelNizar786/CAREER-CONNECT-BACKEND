const express = require('express');
const router = express.Router();
const {adminAuthentication} = require('../middlewares/adminAuth');
const {adminLogin, adminAuth} = require('../controllers/adminController');

router.post('/adminLogin', adminLogin);
router.get('/adminAuth', adminAuthentication, adminAuth);

module.exports = router;