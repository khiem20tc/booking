const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    ID: {
        type: Number
    },
    Customer: {
        type: Number
    },
    Shipper: {
        type: Number
    },
    Value: {
        type: Number
    },
    State: {
        type: String
    },
    Report: {
        type: String
    }
})

module.exports = {OrderEntity: mongoose.model('Order', OrderSchema)};