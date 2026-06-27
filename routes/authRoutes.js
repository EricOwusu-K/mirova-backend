const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/authMiddleware')
const { registerUser, loginUser, getUserProfile, updateUserProfile, getAllUsers } = require('../controllers/authController')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/profile', protect, getUserProfile)
router.get('/users', protect, adminOnly, getAllUsers)
router.put('/profile', protect, updateUserProfile)

module.exports = router