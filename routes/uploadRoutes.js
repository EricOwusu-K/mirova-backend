const express = require('express')
const router = express.Router()
const multer = require('multer')
const FormData = require('form-data')
const fetch = require('node-fetch')
const { cloudinary } = require('../config/cloudinary')
const { protect, adminOnly } = require('../middleware/authMiddleware')

// Use memory storage so we can pass the buffer to remove.bg
const memoryUpload = multer({ storage: multer.memoryStorage() })

router.post('/', protect, adminOnly, memoryUpload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' })
  }

  try {
    // ── Step 1: Send image to remove.bg API ──
    const formData = new FormData()
    formData.append('image_file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    })
    formData.append('size', 'auto')

    const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVEBG_API_KEY,
        ...formData.getHeaders(),
      },
      body: formData,
    })

    if (!removeBgResponse.ok) {
      // If remove.bg fails, fall back to uploading original image
      console.warn('remove.bg failed, uploading original image instead')
      const fallback = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'mirova-jewellery', format: 'png' },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        uploadStream.end(req.file.buffer)
      })
      return res.json({ imageUrl: fallback.secure_url })
    }

    // ── Step 2: Get the background-removed PNG buffer ──
    const bgRemovedBuffer = await removeBgResponse.buffer()

    // ── Step 3: Upload the transparent PNG to Cloudinary ──
    const cloudinaryResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'mirova-jewellery',
          format: 'png',  // must be PNG to preserve transparency
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(bgRemovedBuffer)
    })

    res.json({ imageUrl: cloudinaryResult.secure_url })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ message: 'Image upload failed. Please try again.' })
  }
})

module.exports = router