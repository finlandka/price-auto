const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { JWT_SECRET, REGISTRATION_SECRET_KEY } = process.env;

const createToken = (userId) => jwt.sign({ userId }, JWT_SECRET);

const register = async (req, res) => {
    try {
        const { email, password, secretKey } = req.body;

        if (secretKey !== REGISTRATION_SECRET_KEY) {
            return res.status(403).json({ message: 'Недействительный секретный ключ' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        const user = await User.createUser(email, password);
        const token = createToken(user._id);

        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            token,
            user: { id: user._id, email: user.email }
        });
    } catch (error) {
        console.error('Ошибка при регистрации пользователя:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findUserByCredentials(email, password);
        const token = createToken(user._id);
        res.json({ token });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.json(user);
    } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.userId).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Неверный текущий пароль' });
        }

        await user.changePassword(newPassword);
        res.json({ message: 'Пароль успешно изменен' });
    } catch (error) {
        console.error('Ошибка при смене пароля:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};

module.exports = {
    register,
    login,
    getUser,
    changePassword
};