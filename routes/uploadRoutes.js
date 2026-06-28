const express = require('express')
const router = express.Router()
const { upload } = require('../config/cloudinary')
const { protect, adminOnly } = require('../middleware/authMiddleware')

router.post('/', protect, adminOnly, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' })
  }

  // multer-storage-cloudinary may return URL in different fields
  const imageUrl = req.file.path || req.file.secure_url || req.file.url

  if (!imageUrl) {
    return res.status(500).json({ message: 'Image uploaded but URL not found' })
  }

  res.json({ imageUrl })
})

module.exports = router