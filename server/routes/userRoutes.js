const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateAuth, validateChangePassword } = require('../middlewares/validate');

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', validateAuth, userController.login);
router.get('/admin', authMiddleware, userController.getUser);
router.post('/change-password', authMiddleware, validateChangePassword, userController.changePassword);

module.exports = router;