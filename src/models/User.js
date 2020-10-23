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
        type: Array
    }
})

module.exports = {UserEntity: mongoose.model('Member', UserSchema)};