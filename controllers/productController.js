const asyncHandler = require('express-async-handler')
const Product = require('../models/Product')
const Interaction = require('../models/Interaction')

// @desc    Get all products (with filtering, sorting, search)
// @route   GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const { category, material, minPrice, maxPrice, sort, search, badge } = req.query

  let filter = {}

  if (category && category !== 'All') filter.category = category
  if (material && material !== 'All') filter.material = material
  if (badge) filter.badge = badge
  if (minPrice || maxPrice) {
    filter.price = {}
    if (minPrice) filter.price.$gte = Number(minPrice)
    if (maxPrice) filter.price.$lte = Number(maxPrice)
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ]
  }

  let sortOption = {}
  if (sort === 'Price: Low to High') sortOption = { price: 1 }
  else if (sort === 'Price: High to Low') sortOption = { price: -1 }
  else if (sort === 'Newest') sortOption = { createdAt: -1 }
  else sortOption = { isFeatured: -1, createdAt: -1 }

  const products = await Product.find(filter).sort(sortOption)
  res.json(products)
})

// @desc    Get single product by ID
// @route   GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (product) {
    res.json(product)
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

// @desc    Get featured products
// @route   GET /api/products/featured
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true }).limit(4)
  res.json(products)
})

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
const getNewArrivals = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 }).limit(4)
  res.json(products)
})

// @desc    Create a product (admin only)
// @route   POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const {
    name, description, price, category, material,
    images, tryOnImage, stock, tags, badge, sizes, details, isFeatured
  } = req.body

  const product = await Product.create({
    name, description, price, category, material,
    images: images || [],
    tryOnImage: tryOnImage || '',
    stock: stock || 0,
    tags: tags || [],
    badge: badge || '',
    sizes: sizes || [],
    details: details || [],
    isFeatured: isFeatured || false,
  })

  res.status(201).json(product)
})

// @desc    Update a product (admin only)
// @route   PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )
  res.json(updatedProduct)
})

// @desc    Delete a product (admin only)
// @route   DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }
  await product.deleteOne()
  res.json({ message: 'Product removed' })
})

// @desc    Log user interaction with a product
// @route   POST /api/products/:id/interact
const logInteraction = asyncHandler(async (req, res) => {
  const { type } = req.body
  const product = await Product.findById(req.params.id)

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  const interaction = await Interaction.create({
    user: req.user._id,
    product: req.params.id,
    type,
    category: product.category,
  })

  res.status(201).json(interaction)
})

module.exports = {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getNewArrivals,
  createProduct,
  updateProduct,
  deleteProduct,
  logInteraction,
}