import mongoose from "mongoose"

const parcelSchema = new mongoose.Schema(
  {
    trackingNumber: { type: String, required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    pickupAddress: { type: String, required: true },
    pickupCity: { type: String, required: true },
    pickupLatitude: { type: Number },
    pickupLongitude: { type: Number },
    deliveryAddress: { type: String, required: true },
    deliveryCity: { type: String, required: true },
    deliveryLatitude: { type: Number },
    deliveryLongitude: { type: Number },
    parcelType: {
      type: String,
      enum: ["document", "small-package", "medium-package", "large-package"],
      required: true,
    },
    weight: { type: Number }, // in kg
    paymentMethod: { type: String, enum: ["prepaid", "cod"], required: true },
    codAmount: { type: Number, default: 0 },
    shippingCost: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "picked-up", "in-transit", "delivered", "failed"],
      default: "pending",
    },
    currentLatitude: { type: Number },
    currentLongitude: { type: Number },
    estimatedDeliveryDate: { type: Date },
    actualDeliveryDate: { type: Date },
    notes: { type: String },
    qrCode: { type: String },
  },
  { timestamps: true },
)

export default mongoose.model("Parcel", parcelSchema)
