const mongoose = require('mongoose');

const mailSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userID: { type: String, require: true },
    targetID: { type: String, require: true},
    content: String,
    title: { type: String, default: 'Mail'},
});

module.exports = mongoose.model('mail', mailSchema);