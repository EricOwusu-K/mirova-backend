const asyncHandler = require('express-async-handler')
const Order = require('../models/Order')
const User = require('../models/User')

// @desc    Create new order
// @route   POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body

  if (!orderItems || orderItems.length === 0) {
    res.status(400)
    throw new Error('No order items')
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    totalPrice,
  })

  // Clear the user's cart after order is placed
  const user = await User.findById(req.user._id)
  user.cart = []
  await user.save()

  res.status(201).json(order)
})

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 })
  res.json(orders)
})

// @desc    Get single order by ID
// @route   GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email')

  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }

  // Make sure the order belongs to the logged in user or admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401)
    throw new Error('Not authorized to view this order')
  }

  res.json(order)
})

// @desc    Get all orders (admin only)
// @route   GET /api/orders
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 })
  res.json(orders)
})

// @desc    Update order status (admin only)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  const order = await Order.findById(req.params.id)

  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }

  order.status = status
  if (status === 'delivered') {
    order.isDelivered = true
    order.deliveredAt = Date.now()
  }

  const updatedOrder = await order.save()
  res.json(updatedOrder)
})

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus }