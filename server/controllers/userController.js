const jwt = require('jsonwebtoken');
const User = require('../models/user');

const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Проверяем, существует ли уже пользователь с таким email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        // Создаем нового пользователя, используя метод createUser из модели
        const user = await User.createUser(email, password);

        // Создаем токен для нового пользователя
        const token = jwt.sign({ userId: user._id }, 'secretkey');

        // Отправляем ответ
        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            token,
            user: {
                id: user._id,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Ошибка при регистрации пользователя:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const login = (req, res) => {
    const { email, password } = req.body;

    User.findUserByCredentials(email, password)
        .then((user) => {
            const token = jwt.sign({ userId: user._id }, 'secretkey');
            res.json({ token });
        })
        .catch((error) => {
            res.status(401).json({ message: error.message });
        });
};

const getUser = (req, res) => {
    User.findById(req.userId)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }
            res.json(user);
        })
        .catch((error) => {
            res.status(500).json({ message: 'Ошибка сервера' });
        });
};

module.exports = {
    register,
    login,
    getUser,
};