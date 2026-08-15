const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/authMiddleware')
const {
  registerUser, verifyOtp, resendOtp, loginUser, getUserProfile,
  updateUserProfile, getAllUsers, getWishlist, toggleWishlist,
  forgotPassword, resetPassword,
} = require('../controllers/authController')

router.post('/register', registerUser)
router.post('/verify-otp', verifyOtp)
router.post('/resend-otp', resendOtp)
router.post('/login', loginUser)
router.get('/profile', protect, getUserProfile)
router.get('/users', protect, adminOnly, getAllUsers)
router.put('/profile', protect, updateUserProfile)
router.get('/wishlist', protect, getWishlist)
router.post('/wishlist/:productId', protect, toggleWishlist)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

module.exports = router