const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
//const axios = require('axios');

const transporter = nodemailer.createTransport({
    host: 'smtp.jino.ru',
    port: 587,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const orderValidationRules = [
    body('name').trim().isLength({ min: 2 }).withMessage('Имя должно содержать минимум 2 символа'),
    body('email').isEmail().withMessage('Введите корректный email'),
    body('phone').isMobilePhone('any').withMessage('Введите корректный номер телефона'),
    body('items').isArray({ min: 1 }).withMessage('Корзина не может быть пустой'),
    body('total').isNumeric().withMessage('Некорректная сумма заказа')
];

const formatItemsList = (items) => items.map(item =>
    `${item[0]} - ${item[1]} - ${item[2]} - Количество: ${item.quantity} - Цена: ${item[4]} - Сумма: ${item[4] * item.quantity}`
).join('\n');

const createMailOptions = (name, email, phone, itemsList, total) => ({
    from: '"ООО АСТРА" <finlandka@yandex.ru>',
    to: process.env.ADMIN_EMAIL,
    subject: 'Новый заказ',
    text: `
        Новый заказ от ${name}
        Email: ${email}
        Телефон: ${phone}
        
        Заказанные товары:
        ${itemsList}
        
        Общая сумма: ${total}
    `
});

const submitOrder = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, items, total, /*recaptchaToken*/ } = req.body;

    // Проверка reCAPTCHA
    /*try {
        const recaptchaResponse = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
        );

        if (!recaptchaResponse.data.success) {
            return res.status(400).json({ message: 'reCAPTCHA verification failed' });
        }
    } catch (error) {
        console.error('Error verifying reCAPTCHA:', error);
        return res.status(500).json({ message: 'Error verifying reCAPTCHA' });
    }*/

    const itemsList = formatItemsList(items);
    const mailOptions = createMailOptions(name, email, phone, itemsList, total);

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Успешный заказ от ${name} (${email}) на сумму ${total}`);
        res.status(200).json({ message: 'Order submitted successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Error submitting order', error: error.message });
    }
};

module.exports = {
    validateOrder: orderValidationRules,
    submitOrder
};