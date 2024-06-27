const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: (v) => /^[\w-]+@[\w-]+\.[a-z]+$/.test(v),
            message: 'Некорректный email',
        },
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
}, {
    versionKey: false,
    timestamps: true
});

userSchema.statics.findUserByCredentials = async function(email, password) {
    const user = await this.findOne({ email }).select('+password');
    if (!user) {
        throw new Error('Неправильные почта или пароль');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Неправильные почта или пароль');
    }
    return user;
};

userSchema.statics.createUser = async function(email, password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new this({ email, password: hashedPassword });
    await user.save();

    return this.findById(user._id);
};

userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changePassword = async function(newPassword) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(newPassword, salt);
    await this.save();
};

module.exports = mongoose.model('User', userSchema);