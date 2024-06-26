const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Регистрация пользователя
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/admin', authMiddleware, userController.getUser);

module.exports = router;