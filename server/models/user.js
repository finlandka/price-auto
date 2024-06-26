const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (v) => /[\w-]+@[\w-]*\.[a-z]*/.test(v),
            message: 'Некорректный email',
        },
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
}, { versionKey: false });

userSchema.statics.findUserByCredentials = function findUserByCredentials(email, password) {
    return this.findOne({ email }).select('+password')
        .then((user) => {
            if (!user) {
                throw new Error ('Неправильные почта или пароль');
            }
            return bcrypt.compare(password, user.password)
                .then((matched) => {
                    if (!matched) {
                        throw new Error ('Неправильные почта или пароль');
                    }
                    return user;
                });
        });
};

// Метод для создания пользователя
userSchema.statics.createUser = async function(email, password) {
    // Хешируем пароль
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Создаем нового пользователя
    const user = new this({
        email: email,
        password: hashedPassword
    });

    // Сохраняем пользователя в базе данных
    await user.save();

    // Возвращаем созданного пользователя (без пароля)
    return this.findById(user._id);
};

module.exports = mongoose.model('user', userSchema);