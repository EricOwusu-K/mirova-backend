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
  getRecommendations,
  prepareTryOn,
} = require('../controllers/productController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

router.get('/recommended', protect, getRecommendations)
router.get('/featured', getFeaturedProducts)
router.get('/new-arrivals', getNewArrivals)
router.get('/', getProducts)
router.get('/:id', getProductById)
router.post('/', protect, adminOnly, createProduct)
router.put('/:id', protect, adminOnly, updateProduct)
router.delete('/:id', protect, adminOnly, deleteProduct)
router.post('/:id/interact', protect, logInteraction)
router.post('/:id/prepare-tryon', protect, prepareTryOn)

module.exports = router