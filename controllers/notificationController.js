const asyncHandler = require('express-async-handler')
const Notification = require('../models/Notification')

// @desc    Get logged in user's notifications
// @route   GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20)
  res.json(notifications)
})

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id)
  if (!notification) {
    res.status(404)
    throw new Error('Notification not found')
  }
  notification.isRead = true
  await notification.save()
  res.json(notification)
})

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true })
  res.json({ message: 'All notifications marked as read' })
})

// @desc    Get unread notification count
// @route   GET /api/notifications/count
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user._id, isRead: false })
  res.json({ count })
})

module.exports = { getNotifications, markAsRead, markAllAsRead, getUnreadCount }