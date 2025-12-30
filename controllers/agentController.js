import Parcel from "../models/Parcel.js";
import Delivery from "../models/Delivery.js";
import User from "../models/User.js";
import { verifyQRCode } from "../utils/qrHelper.js";
import { notifyUser } from "../utils/notificationService.js";
import { io } from "../server.js";

export const getAssignedParcels = async (req, res) => {
  try {
    const parcels = await Parcel.find({ agentId: req.user.id });
    res.json({ parcels });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching parcels", error: error.message });
  }
};

export const scanForPickup = async (req, res) => {
  try {
    const { scannedData } = req.body; // QR code scanned data (tracking number)

    // Find parcel by tracking number
    const parcel = await Parcel.findOne({ trackingNumber: scannedData });

    if (!parcel) {
      return res
        .status(404)
        .json({ message: "Parcel not found with this tracking number" });
    }

    // Verify QR code matches
    if (!verifyQRCode(scannedData, parcel.trackingNumber)) {
      return res.status(400).json({ message: "Invalid QR code" });
    }

    // Check if parcel is already picked up
    if (parcel.status !== "pending") {
      return res.status(400).json({
        message: `Parcel is already ${parcel.status}`,
        currentStatus: parcel.status,
      });
    }

    // Check if agent is assigned to this parcel
    if (parcel.agentId && parcel.agentId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not assigned to this parcel" });
    }

    // Assign agent if not already assigned
    if (!parcel.agentId) {
      parcel.agentId = req.user.id;
    }

    // Update parcel status to picked-up
    parcel.status = "picked-up";
    await parcel.save();

    // Create delivery record if doesn't exist
    let delivery = await Delivery.findOne({ parcelId: parcel._id });
    if (!delivery) {
      delivery = new Delivery({
        parcelId: parcel._id,
        agentId: req.user.id,
        status: "picked-up",
        pickedUpTime: new Date(),
      });
      await delivery.save();
    }

    // Notify customer
    const customer = await User.findById(parcel.customerId);
    if (customer) {
      await notifyUser(
        customer,
        "Parcel Picked Up",
        `Your parcel ${parcel.trackingNumber} has been picked up by our agent.`,
        `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #2563eb;">Parcel Picked Up!</h2>
            <p>Hello <strong>${customer.name}</strong>,</p>
            <p>Your parcel with tracking number <strong>${parcel.trackingNumber}</strong> has been picked up by our delivery agent.</p>
            <p>Your parcel is now on its way to the destination.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">Thank you for choosing BackStore.</p>
          </div>
        `
      );
    }

    // Emit socket event
    io.to(`parcel-${parcel._id}`).emit("status-changed", {
      parcelId: parcel._id,
      status: "picked-up",
      agentId: req.user.id,
      timestamp: new Date(),
    });

    res.json({
      message: "Parcel picked up successfully",
      parcel,
      delivery,
    });
  } catch (error) {
    console.error("[v0] Error in scanForPickup:", error);
    res
      .status(500)
      .json({ message: "Error scanning parcel", error: error.message });
  }
};

export const updateDeliveryLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const { parcelId } = req.params;

    // Update parcel current location
    const parcel = await Parcel.findByIdAndUpdate(parcelId, {
      currentLatitude: latitude,
      currentLongitude: longitude,
    });

    // Update delivery route
    const delivery = await Delivery.findOne({ parcelId });
    if (delivery) {
      delivery.route.push({
        latitude,
        longitude,
        timestamp: new Date(),
      });
      delivery.currentLocation = {
        latitude,
        longitude,
        timestamp: new Date(),
      };
      await delivery.save();
    }

    io.to(`parcel-${parcelId}`).emit("location-updated", {
      parcelId,
      latitude,
      longitude,
      agentId: req.user.id,
      timestamp: new Date(),
    });

    res.json({ message: "Location updated" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating location", error: error.message });
  }
};

export const completeDelivery = async (req, res) => {
  try {
    const { parcelId } = req.params;
    const { status, failureReason, signature } = req.body;

    const parcel = await Parcel.findByIdAndUpdate(
      parcelId,
      {
        status,
        actualDeliveryDate: status === "delivered" ? new Date() : null,
      },
      { new: true }
    );

    const delivery = await Delivery.findOneAndUpdate(
      { parcelId },
      {
        status,
        deliveredTime: status === "delivered" ? new Date() : null,
        failureReason,
        signature,
      },
      { new: true }
    );

    io.to(`parcel-${parcelId}`).emit("status-changed", {
      parcelId,
      status,
      agentId: req.user.id,
      timestamp: new Date(),
    });

    res.json({
      message: "Delivery updated",
      parcel,
      delivery,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error completing delivery", error: error.message });
  }
};

export const scanForDelivery = async (req, res) => {
  try {
    const { scannedData, signature } = req.body; // QR code scanned data and optional signature

    // Find parcel by tracking number
    const parcel = await Parcel.findOne({ trackingNumber: scannedData });

    if (!parcel) {
      return res
        .status(404)
        .json({ message: "Parcel not found with this tracking number" });
    }

    // Verify QR code matches
    if (!verifyQRCode(scannedData, parcel.trackingNumber)) {
      return res.status(400).json({ message: "Invalid QR code" });
    }

    // Check if parcel is already delivered
    if (parcel.status === "delivered") {
      return res.status(400).json({
        message: "Parcel is already delivered",
        deliveryDate: parcel.actualDeliveryDate,
      });
    }

    // Check if parcel was picked up
    if (parcel.status === "pending") {
      return res.status(400).json({
        message: "Parcel must be picked up before delivery",
      });
    }

    // Check if agent is assigned to this parcel
    if (parcel.agentId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not assigned to this parcel" });
    }

    // Update parcel status to delivered
    parcel.status = "delivered";
    parcel.actualDeliveryDate = new Date();
    await parcel.save();

    // Update delivery record
    const delivery = await Delivery.findOneAndUpdate(
      { parcelId: parcel._id },
      {
        status: "delivered",
        deliveredTime: new Date(),
        signature: signature || null,
      },
      { new: true }
    );

    // Notify customer
    const customer = await User.findById(parcel.customerId);
    if (customer) {
      await notifyUser(
        customer,
        "Parcel Delivered Successfully",
        `Your parcel ${parcel.trackingNumber} has been delivered successfully.`,
        `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #16a34a;">Parcel Delivered!</h2>
            <p>Hello <strong>${customer.name}</strong>,</p>
            <p>Your parcel with tracking number <strong>${
              parcel.trackingNumber
            }</strong> has been successfully delivered.</p>
            <p><strong>Delivery Date:</strong> ${parcel.actualDeliveryDate.toLocaleString()}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">Thank you for choosing BackStore. We hope to serve you again!</p>
          </div>
        `
      );
    }

    // Emit socket event
    io.to(`parcel-${parcel._id}`).emit("status-changed", {
      parcelId: parcel._id,
      status: "delivered",
      agentId: req.user.id,
      timestamp: new Date(),
    });

    io.emit("delivery-completed", {
      parcelId: parcel._id,
      trackingNumber: parcel.trackingNumber,
      agentId: req.user.id,
      completedAt: new Date(),
    });

    res.json({
      message: "Parcel delivered successfully",
      parcel,
      delivery,
    });
  } catch (error) {
    console.error("QR Error in scanForDelivery:", error);
    res
      .status(500)
      .json({ message: "Error scanning parcel", error: error.message });
  }
};
