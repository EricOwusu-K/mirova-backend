const express = require('express')
const router = express.Router()
const {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getNewArrivals,
  createProduct,
  updateProduct,
  deleteProduct,
  logInteraction,
} = require('../controllers/productController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

router.get('/featured', getFeaturedProducts)
router.get('/new-arrivals', getNewArrivals)
router.get('/', getProducts)
router.get('/:id', getProductById)
router.post('/', protect, adminOnly, createProduct)
router.put('/:id', protect, adminOnly, updateProduct)
router.delete('/:id', protect, adminOnly, deleteProduct)
router.post('/:id/interact', protect, logInteraction)

module.exports = router