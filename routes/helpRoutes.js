const express = require('express')
const router = express.Router()
const { submitHelpRequest, getHelpRequests, updateHelpRequest } = require('../controllers/helpController')
const { protect, adminOnly } = require('../middleware/authMiddleware')

router.post('/', protect, submitHelpRequest)
router.get('/', protect, adminOnly, getHelpRequests)
router.put('/:id', protect, adminOnly, updateHelpRequest)

module.exports = router