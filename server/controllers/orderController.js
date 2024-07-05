const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const axios = require('axios');

const transporter = nodemailer.createTransport({
    host: 'smtp.jino.ru',
    port: 465,
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

const createMailOptions = (name, email, phone, items, total) => ({
    from: `"ООО Астра Автозапчасти" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: 'Новый заказ',
    html: `
        <html lang="ru">
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #0066cc;">Новый заказ</h2>
                <p><strong>Имя:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Телефон:</strong> ${phone}</p>
                
                <h3 style="color: #0066cc;">Заказанные товары:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background-color: #f2f2f2;">
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Бренд</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Артикул</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Наименование</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Количество</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Цена</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Сумма</th>
                    </tr>
                    ${items.map(item => `
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;">${item[0]}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${item[1]}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${item[2]}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.quantity}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item[4]}</td>
                            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item[4] * item.quantity}</td>
                        </tr>
                    `).join('')}
                </table>
                
                <p style="font-size: 18px; margin-top: 20px;"><strong>Общая сумма:</strong> ${total} руб.</p>
            </body>
        </html>
    `
});

const submitOrder = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, items, total, recaptchaToken } = req.body;

    // Проверка reCAPTCHA
    try {
        const recaptchaResponse = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: recaptchaToken
                }
            }
        );

        if (!recaptchaResponse.data.success) {
            return res.status(400).json({ message: 'reCAPTCHA verification failed', errors: recaptchaResponse.data['error-codes'] });
        }

        // проверку score
        if (recaptchaResponse.data.score < 0.5) {
            return res.status(400).json({ message: 'reCAPTCHA score too low', score: recaptchaResponse.data.score });
        }

    } catch (error) {
        console.error('Error verifying reCAPTCHA:', error);
        return res.status(500).json({ message: 'Error verifying reCAPTCHA' });
    }

    const mailOptions = createMailOptions(name, email, phone, items, total);

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