const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const axios = require('axios');

// Настройка транспорта для отправки email
const transporter = nodemailer.createTransport({
    host: 'your-smtp-host',
    port: 587,
    secure: false,
    auth: {
        user: 'your-email@example.com',
        pass: 'your-email-password'
    }
});

// Валидация данных
exports.validateOrder = [
    body('name').trim().isLength({ min: 2 }).withMessage('Имя должно содержать минимум 2 символа'),
    body('email').isEmail().withMessage('Введите корректный email'),
    body('phone').isMobilePhone('any').withMessage('Введите корректный номер телефона'),
    body('items').isArray({ min: 1 }).withMessage('Корзина не может быть пустой'),
    body('total').isNumeric().withMessage('Некорректная сумма заказа')
];

// Обработка заказа
exports.submitOrder = async (req, res) => {
    // Проверка результатов валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, items, total, captchaToken } = req.body;

    // Проверка hCaptcha
    try {
        const verificationResponse = await axios.post(
            'https://hcaptcha.com/siteverify',
            `response=${captchaToken}&secret=YOUR_HCAPTCHA_SECRET_KEY`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        if (!verificationResponse.data.success) {
            return res.status(400).json({ message: 'hCaptcha verification failed' });
        }
    } catch (error) {
        console.error('hCaptcha verification error:', error);
        return res.status(500).json({ message: 'Error verifying hCaptcha' });
    }

    const itemsList = items.map(item =>
        `${item[0]} - ${item[1]} - ${item[2]} - Количество: ${item.quantity} - Цена: ${item[4]} - Сумма: ${item[4] * item.quantity}`
    ).join('\n');

    const mailOptions = {
        from: '"Your Store" <your-email@example.com>',
        to: 'admin@example.com', // email админа
        subject: 'Новый заказ',
        text: `
            Новый заказ от ${name}
            Email: ${email}
            Телефон: ${phone}
            
            Заказанные товары:
            ${itemsList}
            
            Общая сумма: ${total}
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Order submitted successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Error submitting order' });
    }
};