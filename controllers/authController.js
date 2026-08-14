const asyncHandler = require('express-async-handler')
const User = require('../models/User')
const Product = require('../models/Product')
const Interaction = require('../models/Interaction')
const generateToken = require('../utils/generateToken')
const sendOtpEmail = require('../utils/sendEmail')

// Helper: generate a 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString()

// @desc    Register a new user (creates unverified account + sends OTP)
// @route   POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body
  if (!firstName || !lastName || !email || !phone || !password) {
    res.status(400); throw new Error('Please fill in all fields')
  }
  const userExists = await User.findOne({ email })
  if (userExists) {
    // If they exist but never verified, allow re-sending OTP
    if (!userExists.isVerified) {
      const otp = generateOtp()
      userExists.otp = otp
      userExists.otpExpiry = Date.now() + 10 * 60 * 1000
      await userExists.save()
      await sendOtpEmail(userExists.email, otp, userExists.name)
      return res.status(200).json({
        message: 'Account exists but is unverified. A new code has been sent.',
        email: userExists.email,
        needsVerification: true,
      })
    }
    res.status(400); throw new Error('An account with this email already exists')
  }

  const otp = generateOtp()
  const user = await User.create({
    name: `${firstName} ${lastName}`,
    email,
    phone,
    password,
    otp,
    otpExpiry: Date.now() + 10 * 60 * 1000,  // 10 minutes
    isVerified: false,
  })

  if (user) {
    // Send the OTP email
    await sendOtpEmail(user.email, otp, user.name)

    res.status(201).json({
      message: 'Verification code sent to your email.',
      email: user.email,
      needsVerification: true,
    })
  } else {
    res.status(400); throw new Error('Invalid user data')
  }
})

// @desc    Verify OTP and activate account
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
    res.status(400); throw new Error('Account is already verified. Please log in.')
  }
  if (user.otp !== otp) {
    res.status(400); throw new Error('Invalid verification code')
  }
  if (user.otpExpiry < Date.now()) {
    res.status(400); throw new Error('Verification code has expired. Please request a new one.')
  }

  // Mark verified and clear OTP
  user.isVerified = true
  user.otp = undefined
  user.otpExpiry = undefined
  await user.save()

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  })
})

// @desc    Resend OTP code
// @route   POST /api/auth/resend-otp
const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email })
  if (!user) {
    res.status(404); throw new Error('User not found')
  }
  if (user.isVerified) {
    res.status(400); throw new Error('Account is already verified. Please log in.')
  }

  const otp = generateOtp()
  user.otp = otp
  user.otpExpiry = Date.now() + 10 * 60 * 1000
  await user.save()
  await sendOtpEmail(user.email, otp, user.name)

  res.json({ message: 'A new verification code has been sent to your email.' })
})

// @desc    Login user (blocks unverified accounts)
// @route   POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (user && (await user.matchPassword(password))) {
    // Block login if not verified
    if (!user.isVerified) {
      // Send a fresh OTP so they can verify
      const otp = generateOtp()
      user.otp = otp
      user.otpExpiry = Date.now() + 10 * 60 * 1000
      await user.save()
      await sendOtpEmail(user.email, otp, user.name)
      return res.status(403).json({
        message: 'Please verify your email first. A new code has been sent.',
        email: user.email,
        needsVerification: true,
      })
    }

    res.json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, token: generateToken(user._id),
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
}