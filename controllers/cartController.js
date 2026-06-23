const asyncHandler = require('express-async-handler')
const User = require('../models/User')
const Product = require('../models/Product')

// Cart is stored on the User document as an array
// We'll add a cart field to the User model

// @desc    Get user cart
// @route   GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('cart.product')
  res.json(user.cart)
})

// @desc    Add item to cart
// @route   POST /api/cart
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, size } = req.body

  const product = await Product.findById(productId)
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  const user = await User.findById(req.user._id)

  const existingItem = user.cart.find(
    item => item.product.toString() === productId && item.size === size
  )

  if (existingItem) {
    existingItem.quantity += quantity || 1
  } else {
    user.cart.push({
      product: productId,
      quantity: quantity || 1,
      size: size || '',
    })
  }

  await user.save()
  await user.populate('cart.product')
  res.json(user.cart)
})

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity, size } = req.body
  const user = await User.findById(req.user._id)

  const item = user.cart.find(
    item => item.product.toString() === req.params.productId && item.size === size
  )

  if (!item) {
    res.status(404)
    throw new Error('Item not found in cart')
  }

  if (quantity <= 0) {
    user.cart = user.cart.filter(
      item => !(item.product.toString() === req.params.productId && item.size === size)
    )
  } else {
    item.quantity = quantity
  }

  await user.save()
  await user.populate('cart.product')
  res.json(user.cart)
})

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
const removeFromCart = asyncHandler(async (req, res) => {
  const { size } = req.query
  const user = await User.findById(req.user._id)

  user.cart = user.cart.filter(
    item => !(item.product.toString() === req.params.productId && item.size === size)
  )

  await user.save()
  await user.populate('cart.product')
  res.json(user.cart)
})

// @desc    Clear entire cart
// @route   DELETE /api/cart
const clearCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  user.cart = []
  await user.save()
  res.json({ message: 'Cart cleared' })
})

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart }