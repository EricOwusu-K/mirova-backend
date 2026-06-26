const asyncHandler = require('express-async-handler')
const HelpRequest = require('../models/HelpRequest')

// @desc    Submit a help request
// @route   POST /api/help
const submitHelpRequest = asyncHandler(async (req, res) => {
  const { type, subject, message, orderId } = req.body

  if (!type || !subject || !message) {
    res.status(400)
    throw new Error('Please fill in all required fields')
  }

  const request = await HelpRequest.create({
    user: req.user._id,
    type,
    subject,
    message,
    orderId: orderId || '',
  })

  res.status(201).json(request)
})

// @desc    Get all help requests (admin only)
// @route   GET /api/help
const getHelpRequests = asyncHandler(async (req, res) => {
  const requests = await HelpRequest.find()
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 })
  res.json(requests)
})

// @desc    Update help request status (admin only)
// @route   PUT /api/help/:id
const updateHelpRequest = asyncHandler(async (req, res) => {
  const request = await HelpRequest.findById(req.params.id)
  if (!request) {
    res.status(404)
    throw new Error('Help request not found')
  }
  request.status = req.body.status || request.status
  await request.save()
  res.json(request)
})

module.exports = { submitHelpRequest, getHelpRequests, updateHelpRequest }