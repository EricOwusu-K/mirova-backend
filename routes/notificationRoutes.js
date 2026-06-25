const express = require('express')
const router = express.Router()
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} = require('../controllers/notificationController')
const { protect } = require('../middleware/authMiddleware')

router.get('/', protect, getNotifications)
router.get('/count', protect, getUnreadCount)
router.put('/read-all', protect, markAllAsRead)
router.put('/:id/read', protect, markAsRead)

module.exports = router