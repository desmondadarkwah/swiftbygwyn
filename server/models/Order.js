import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  orderID: { type: String, unique: true },

  // Customer info
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },

  // Recipient info
  recipientName: { type: String, required: true },
  recipientPhone: { type: String, required: true },

  // Locations
  pickupLocation: { type: String, required: true },
  dropoffLocation: { type: String, required: true },
  pickupCoords: {
    lat: { type: Number },
    lng: { type: Number },
  },
  dropoffCoords: {
    lat: { type: Number },
    lng: { type: Number },
  },
  distance: { type: Number, default: 0 }, // in KM

  // Delivery details
  deliveryType: {
    type: String,
    enum: ['standard', 'same-day', 'express', 'scheduled'],
    default: 'standard'
  },
  scheduledDate: { type: String, default: '' },
  scheduledTime: { type: String, default: '' },

  // Package
  packageDescription: { type: String, required: true },
  packageImage: { type: String, default: '' },
  additionalNotes: { type: String, default: '' },

  // Pricing
  deliveryFee: { type: Number, default: 0 },
  paymentMethod: {
    type: String,
    enum: ['mobile-money', 'cash'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },

  // Status
  status: {
    type: String,
    enum: ['received', 'assigned', 'picked-up', 'in-transit', 'delivered', 'cancelled'],
    default: 'received'
  },

  // Rider
  assignedRider: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', default: null },

  // Proof of delivery
  proofPhoto: { type: String, default: '' },
  proofRecipientName: { type: String, default: '' },

}, { timestamps: true })

// Auto-generate Order ID before saving
orderSchema.pre('save', async function () {
  if (!this.orderID) {
    const count = await mongoose.model('Order').countDocuments()
    this.orderID = `SWG${String(count + 1).padStart(3, '0')}`
  }
})

export default mongoose.model('Order', orderSchema)