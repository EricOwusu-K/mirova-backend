const asyncHandler = require('express-async-handler')
const User = require('../models/User')
const Product = require('../models/Product')
const Interaction = require('../models/Interaction')
const generateToken = require('../utils/generateToken')

const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body
  if (!firstName || !lastName || !email || !phone || !password) {
    res.status(400); throw new Error('Please fill in all fields')
  }
  const userExists = await User.findOne({ email })
  if (userExists) {
    res.status(400); throw new Error('An account with this email already exists')
  }
  const user = await User.create({ name: `${firstName} ${lastName}`, email, phone, password })
  if (user) {
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, token: generateToken(user._id),
    })
  } else {
    res.status(400); throw new Error('Invalid user data')
  }
})

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })
  if (user && (await user.matchPassword(password))) {
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
    // Remove from wishlist
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId)
    await user.save()
    return res.json({ wishlisted: false })
  }

  // Add to wishlist
  user.wishlist.push(productId)
  await user.save()

  // Log interaction → feeds recommendation engine
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
  registerUser, loginUser, getUserProfile,
  updateUserProfile, getAllUsers, getWishlist, toggleWishlist,
}