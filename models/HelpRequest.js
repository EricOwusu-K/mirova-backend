const mongoose = require('mongoose')

const helpRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['complaint', 'refund', 'track', 'inquiry'],
      required: true,
    },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    orderId: { type: String, default: '' },
    status: {
      type: String,
      enum: ['open', 'resolved'],
      default: 'open',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('HelpRequest', helpRequestSchema)