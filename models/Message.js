const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    messageText: { type: String, required: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Message', messageSchema)