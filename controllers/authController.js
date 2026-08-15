const asyncHandler = require('express-async-handler')
const User = require('../models/User')
const Product = require('../models/Product')
const Interaction = require('../models/Interaction')
const generateToken = require('../utils/generateToken')
const sendOtpEmail = require('../utils/sendEmail')

const MASTER_OTP = '000000'  // temporary bypass for testing
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString()

// @desc    Register — creates account immediately, sends OTP (non-blocking)
// @route   POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body
  if (!firstName || !lastName || !email || !phone || !password) {
    res.status(400); throw new Error('Please fill in all fields')
  }

  const userExists = await User.findOne({ email })
  if (userExists) {
    res.status(400); throw new Error('An account with this email already exists')
  }

  const otp = generateOtp()

  // Create the account immediately
  const user = await User.create({
    name: `${firstName} ${lastName}`,
    email,
    phone,
    password,
    otp,
    otpExpiry: Date.now() + 10 * 60 * 1000,
    isVerified: false,
  })

  // Try to send the OTP — but DON'T fail registration if it doesn't send
  try {
    await sendOtpEmail(email, otp, user.name)
  } catch (err) {
    console.error('OTP email could not be sent (registration still succeeded):', err.message)
  }

  // Log them in immediately with a token
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    token: generateToken(user._id),
    needsVerification: true,
  })
})

// @desc    Verify OTP → mark existing account as verified
// @route   POST /api/auth/verify-otp
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body
  if (!email || !otp) {
    res.status(400); throw new Error('Email and code are required')
  }

  const user = await User.findOne({ email })
  if (!user) {
    res.status(404); throw new Error('User not found')
  }
  if (user.isVerified) {
    return res.json({ message: 'Account already verified.', isVerified: true })
  }

  const isMaster = otp === MASTER_OTP
  if (!isMaster) {
    if (user.otp !== otp) {
      res.status(400); throw new Error('Invalid verification code')
    }
    if (user.otpExpiry < Date.now()) {
      res.status(400); throw new Error('Verification code has expired. Please request a new one.')
    }
  }

  user.isVerified = true
  user.otp = undefined
  user.otpExpiry = undefined
  await user.save()

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: true,
    token: generateToken(user._id),
  })
})

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email })
  if (!user) {
    res.status(404); throw new Error('User not found')
  }
  if (user.isVerified) {
    res.status(400); throw new Error('Account is already verified.')
  }

  const otp = generateOtp()
  user.otp = otp
  user.otpExpiry = Date.now() + 10 * 60 * 1000
  await user.save()

  try {
    await sendOtpEmail(email, otp, user.name)
  } catch (err) {
    console.error('OTP resend failed:', err.message)
    res.status(500)
    throw new Error('Could not resend verification code.')
  }

  res.json({ message: 'A new verification code has been sent to your email.' })
})


// @desc    Forgot password — send a reset code to the user's email
// @route   POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  if (!email) {
    res.status(400); throw new Error('Email is required')
  }

  const user = await User.findOne({ email })
  // For security, don't reveal whether the email exists — but still try to send
  if (!user) {
    return res.json({ message: 'If an account exists, a reset code has been sent.' })
  }

  const otp = generateOtp()
  user.otp = otp
  user.otpExpiry = Date.now() + 10 * 60 * 1000
  await user.save()

  try {
    await sendOtpEmail(email, otp, user.name)
  } catch (err) {
    console.error('Reset code email failed:', err.message)
    res.status(500)
    throw new Error('Could not send reset code. Please try again.')
  }

  res.json({ message: 'A password reset code has been sent to your email.', email })
})

// @desc    Reset password — verify code and set new password
// @route   POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body
  if (!email || !otp || !newPassword) {
    res.status(400); throw new Error('All fields are required')
  }
  if (newPassword.length < 6) {
    res.status(400); throw new Error('Password must be at least 6 characters')
  }

  const user = await User.findOne({ email })
  if (!user) {
    res.status(404); throw new Error('User not found')
  }

  // Accept master code or the real reset code
  const isMaster = otp === MASTER_OTP
  if (!isMaster) {
    if (user.otp !== otp) {
      res.status(400); throw new Error('Invalid reset code')
    }
    if (user.otpExpiry < Date.now()) {
      res.status(400); throw new Error('Reset code has expired. Please request a new one.')
    }
  }

  // Set new password (hashed automatically by the pre-save hook)
  user.password = newPassword
  user.otp = undefined
  user.otpExpiry = undefined
  await user.save()

  res.json({ message: 'Password reset successfully. You can now log in.' })
})

// @desc    Login — everyone can log in (no verification block)
// @route   POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      token: generateToken(user._id),
    })
  } else {
    res.status(401); throw new Error('Invalid email or password')
  }
})

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password')
  if (user) res.json(user)
  else { res.status(404); throw new Error('User not found') }
})

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user) { res.status(404); throw new Error('User not found') }
  user.name = req.body.name || user.name
  user.email = req.body.email || user.email
  user.phone = req.body.phone || user.phone
  if (req.body.password) {
    if (req.body.password.length < 6) {
      res.status(400); throw new Error('Password must be at least 6 characters')
    }
    user.password = req.body.password
  }
  const updatedUser = await user.save()
  res.json({
    _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email,
    phone: updatedUser.phone, role: updatedUser.role,
    token: generateToken(updatedUser._id),
  })
})

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 })
  res.json(users)
})

// @desc    Get logged in user's wishlist
// @route   GET /api/auth/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist')
  res.json(user.wishlist || [])
})

// @desc    Toggle product in wishlist + log interaction
// @route   POST /api/auth/wishlist/:productId
const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params
  const user = await User.findById(req.user._id)
  const exists = user.wishlist.some(id => id.toString() === productId)

  if (exists) {
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId)
    await user.save()
    return res.json({ wishlisted: false })
  }

  user.wishlist.push(productId)
  await user.save()

  const product = await Product.findById(productId)
  await Interaction.create({
    user: req.user._id,
    product: productId,
    type: 'wishlist',
    category: product?.category || '',
  })

  res.json({ wishlisted: true })
})

module.exports = {
  registerUser, verifyOtp, resendOtp, loginUser, getUserProfile,
  updateUserProfile, getAllUsers, getWishlist, toggleWishlist,
  forgotPassword, resetPassword,
}