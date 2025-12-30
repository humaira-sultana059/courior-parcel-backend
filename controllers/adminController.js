import User from "../models/User.js"
import Parcel from "../models/Parcel.js"
import Delivery from "../models/Delivery.js"
import { io } from "../server.js"

export const getDashboardMetrics = async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dailyBookings = await Parcel.countDocuments({
      createdAt: { $gte: today },
    })

    const failedDeliveries = await Parcel.countDocuments({
      status: "failed",
    })

    const codAmount = await Parcel.aggregate([
      { $match: { paymentMethod: "cod", status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$codAmount" } } },
    ])

    const totalParcels = await Parcel.countDocuments()
    const deliveredParcels = await Parcel.countDocuments({ status: "delivered" })

    res.json({
      dailyBookings,
      failedDeliveries,
      codAmount: codAmount[0]?.total || 0,
      totalParcels,
      deliveredParcels,
      deliveryRate: totalParcels > 0 ? ((deliveredParcels / totalParcels) * 100).toFixed(2) : 0,
    })
  } catch (error) {
    res.status(500).json({ message: "Error fetching metrics", error: error.message })
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password")
    res.json({ users })
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message })
  }
}

export const getAllParcels = async (req, res) => {
  try {
    const parcels = await Parcel.find()
      .populate("customerId", "name email phone")
      .populate("agentId", "name email phone")
    res.json({ parcels })
  } catch (error) {
    res.status(500).json({ message: "Error fetching parcels", error: error.message })
  }
}

export const assignAgent = async (req, res) => {
  try {
    const { parcelId, agentId } = req.body

    // Get agent details
    const agent = await User.findById(agentId)
    if (!agent) {
      return res.status(404).json({ message: "Agent not found" })
    }

    // Get parcel details
    const parcel = await Parcel.findByIdAndUpdate(parcelId, { agentId }, { new: true })
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" })
    }

    // Create delivery record
    const delivery = new Delivery({
      parcelId,
      agentId,
      status: "assigned",
    })

    await delivery.save()

    io.emit("agent-assigned", {
      parcelId,
      agentId,
      agentName: agent.name,
      trackingNumber: parcel.trackingNumber,
      pickupCity: parcel.pickupCity,
      deliveryCity: parcel.deliveryCity,
    })

    res.json({
      message: "Agent assigned successfully",
      parcel,
      delivery,
    })
  } catch (error) {
    res.status(500).json({ message: "Error assigning agent", error: error.message })
  }
}
