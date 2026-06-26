const express = require('express')
const router = express.Router()
const { sendMessage, getSentMessages } = require('../controllers/messageController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

router.post('/', protect, adminOnly, sendMessage)
router.get('/', protect, adminOnly, getSentMessages)

module.exports = router