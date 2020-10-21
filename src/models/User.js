const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    userName: {
        type: String
    },
    password: {
        type: String
    },
    role: {
        type: String
    },
    avatar: {
        type: Object
    },
    history: {
        type: String
    }
})

module.exports = {UserEntity: mongoose.model('Member', UserSchema)};