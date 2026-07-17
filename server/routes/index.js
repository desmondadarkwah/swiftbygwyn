import express from 'express'
import { protect, protectRider } from '../middleware/authMiddleware.js'
import { upload } from '../middleware/uploadMiddleware.js'
import { setupAdmin, loginAdmin, changePassword } from '../controllers/authController.js'
import { createRider, loginRider, getAllRiders, getRiderMe, updateRiderStatus, deleteRider } from '../controllers/riderController.js'
import {
  createOrder, getAllOrders, trackOrder, getRiderOrders,
  assignRider, updateOrderStatus, uploadProof, getStats
} from '../controllers/orderController.js'
import { getSettings, updateSettings } from '../controllers/settingsController.js'

const router = express.Router()

// ─── HEALTH ───────────────────────────────────────────
router.get('/health', (req, res) => res.json({ message: 'SwiftByGwyn server is running ✅' }))

// ─── ADMIN AUTH ───────────────────────────────────────
router.post('/auth/setup', setupAdmin)
router.post('/auth/login', loginAdmin)

// ─── SETTINGS ─────────────────────────────────────────
router.get('/settings', getSettings)
router.put('/settings', protect, updateSettings)

// ─── CHANGE PASSWORD ──────────────────────────────────
router.put('/auth/change-password', protect, changePassword)

// ─── RIDERS ───────────────────────────────────────────
router.post('/riders/login', loginRider)
router.get('/riders/me', protectRider, getRiderMe)
router.post('/riders', protect, createRider)
router.get('/riders', protect, getAllRiders)
router.put('/riders/:id/status', protect, updateRiderStatus)
router.delete('/riders/:id', protect, deleteRider)

// ─── ORDERS ───────────────────────────────────────────
router.post('/orders', upload.single('packageImage'), createOrder)
router.get('/orders/track/:orderID', trackOrder)
router.get('/orders/stats', protect, getStats)
router.get('/orders', protect, getAllOrders)
router.get('/orders/rider', protectRider, getRiderOrders)
router.put('/orders/:id/assign', protect, assignRider)
router.put('/orders/:id/status', protect, updateOrderStatus)
router.put('/orders/:id/proof', protectRider, upload.single('proofPhoto'), uploadProof)

export default router