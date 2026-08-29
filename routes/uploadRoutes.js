const express = require('express')
const router = express.Router()
const multer = require('multer')
const { cloudinary } = require('../config/cloudinary')
const { protect, adminOnly } = require('../middleware/authMiddleware')

// Use memory storage so we can pass the buffer to Cloudinary
const memoryUpload = multer({ storage: multer.memoryStorage() })

router.post('/', protect, adminOnly, memoryUpload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' })
  }

  try {
    // Upload the image straight to Cloudinary, keeping its background
    const cloudinaryResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'mirova-jewellery' },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(req.file.buffer)
    })

    res.json({ imageUrl: cloudinaryResult.secure_url })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ message: 'Image upload failed. Please try again.' })
  }
})

module.exports = router