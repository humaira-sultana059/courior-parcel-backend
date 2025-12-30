import mongoose from "mongoose"

const deliverySchema = new mongoose.Schema(
  {
    parcelId: { type: mongoose.Schema.Types.ObjectId, ref: "Parcel", required: true },
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["assigned", "picked-up", "in-transit", "delivered", "failed"],
      default: "assigned",
    },
    pickedUpTime: { type: Date },
    deliveredTime: { type: Date },
    failureReason: { type: String },
    signature: { type: String }, // base64 or URL
    photos: [{ type: String }], // URLs
    currentLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      timestamp: { type: Date },
    },
    route: [
      {
        latitude: { type: Number },
        longitude: { type: Number },
        timestamp: { type: Date },
      },
    ],
  },
  { timestamps: true },
)

export default mongoose.model("Delivery", deliverySchema)
