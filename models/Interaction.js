const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    type: {
      type: String,
      enum: ['view', 'click', 'cart', 'purchase', 'tryon', 'wishlist'],
      required: true,
    },
    category: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interaction', interactionSchema);