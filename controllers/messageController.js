const asyncHandler = require('express-async-handler')
const Message = require('../models/Message')
const Notification = require('../models/Notification')

// @desc    Send a message to a customer (admin only)
// @route   POST /api/messages
const sendMessage = asyncHandler(async (req, res) => {
  const { recipientId, subject, messageText } = req.body

  if (!recipientId || !subject || !messageText) {
    res.status(400)
    throw new Error('Please fill in all fields')
  }

  const message = await Message.create({
    sender: req.user._id,
    recipient: recipientId,
    subject,
    messageText,
  })

  // Create a notification for the customer
  await Notification.create({
    user: recipientId,
    title: `Message from Mirova: ${subject}`,
    message: messageText,
    type: 'message',
  })

  await message.populate('recipient', 'name email')
  res.status(201).json(message)
})

// @desc    Get all sent messages (admin only)
// @route   GET /api/messages
const getSentMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ sender: req.user._id })
    .populate('recipient', 'name email')
    .sort({ createdAt: -1 })
  res.json(messages)
})

module.exports = { sendMessage, getSentMessages }