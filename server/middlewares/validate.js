const { celebrate, Joi } = require('celebrate');

const validateAuth = celebrate({
    body: Joi.object().keys({
        email: Joi.string().required().email().regex(/[\w-]+@[\w-]*\.[a-z]*/),
        password: Joi.string().required(),
    }),
});

module.exports = {validateAuth};