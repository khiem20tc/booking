const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    ID: {
        type: Number
    },
    Customer: {
        type: String
    },
    Shipper: {
        type: String
    },
    Value: {
        type: Number
    },
    State: {
        type: String
    },
    ReportByCustomer: {
        type: String
    },
    ReportByShipper: {
        type: String
    }
})

module.exports = {OrderEntity: mongoose.model('Order', OrderSchema)};