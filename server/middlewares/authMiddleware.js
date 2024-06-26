const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Необходима авторизация' });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), 'secretkey');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Неверный токен' });
    }
};

module.exports = authMiddleware;