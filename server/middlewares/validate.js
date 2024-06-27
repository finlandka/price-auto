const { celebrate, Joi } = require('celebrate');

const validateAuth = celebrate({
    body: Joi.object().keys({
        email: Joi.string().required().email().regex(/[\w-]+@[\w-]*\.[a-z]*/),
        password: Joi.string().required(),
    }),
});

const validateChangePassword = celebrate({
    body: Joi.object().keys({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().required().min(6),
    }),
});

const validateRegistration = celebrate({
    body: Joi.object().keys({
        email: Joi.string().required().email().regex(/[\w-]+@[\w-]*\.[a-z]*/),
        password: Joi.string().required().min(6),
        secretKey: Joi.string().required()
    }),
});

module.exports = {validateAuth, validateChangePassword, validateRegistration};