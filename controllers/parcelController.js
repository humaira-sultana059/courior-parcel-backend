import Parcel from "../models/Parcel.js";
import User from "../models/User.js";
import { generateTrackingNumber } from "../utils/helpers.js";
import { generateQRCode } from "../utils/qrHelper.js"; // Added QR code helper
import { io } from "../server.js";
import { notifyUser } from "../utils/notificationService.js";

export const bookParcel = async (req, res) => {
  try {
    const {
      pickupAddress,
      pickupCity,
      deliveryAddress,
      deliveryCity,
      parcelType,
      weight,
      paymentMethod,
      codAmount,
      shippingCost,
    } = req.body;

    const trackingNumber = generateTrackingNumber();

    const qrCode = await generateQRCode(trackingNumber);

    const parcel = new Parcel({
      trackingNumber,
      customerId: req.user.id,
      pickupAddress,
      pickupCity,
      deliveryAddress,
      deliveryCity,
      parcelType,
      weight,
      paymentMethod,
      codAmount,
      shippingCost,
      estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      qrCode, // Save QR code to parcel
    });

    await parcel.save();

    const customer = await User.findById(req.user.id);
    if (customer) {
      await notifyUser(
        customer,
        "Parcel Booked Successfully",
        `Hello ${customer.name}, your parcel ${parcel.trackingNumber} is booked.`,
        `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #2563eb;">Parcel Booked Successfully!</h2>
            <p>Hello <strong>${customer.name}</strong>,</p>
            <p>Your parcel with tracking number <strong>${
              parcel.trackingNumber
            }</strong> has been booked and is now being processed.</p>
            <p><strong>Estimated Delivery:</strong> ${parcel.estimatedDeliveryDate.toDateString()}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666;">Thank you for choosing BackStore.</p>
          </div>
        `
      );
    }

    io.emit("parcel-booked", {
      parcelId: parcel._id,
      trackingNumber: parcel.trackingNumber,
      pickupCity: parcel.pickupCity,
      deliveryCity: parcel.deliveryCity,
      customerId: req.user.id,
    });

    res.status(201).json({
      message: "Parcel booked successfully",
      parcel,
    });
  } catch (error) {
    res.status(500).json({ message: "Booking error", error: error.message });
  }
};

export const getParcelsByCustomer = async (req, res) => {
  try {
    const parcels = await Parcel.find({ customerId: req.user.id });
    res.json({ parcels });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching parcels", error: error.message });
  }
};

export const getParcelById = async (req, res) => {
  try {
    const parcel = await Parcel.findById(req.params.id);
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }
    res.json({ parcel });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching parcel", error: error.message });
  }
};

export const updateParcelStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const parcel = await Parcel.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );

    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    const customer = await User.findById(parcel.customerId);
    if (customer) {
      await notifyUser(
        customer,
        "Parcel Status Updated",
        `Update: Your parcel (${parcel.trackingNumber}) status is now: ${status}.`
      );
    }

    io.emit("status-updated", {
      parcelId: parcel._id,
      status: parcel.status,
      trackingNumber: parcel.trackingNumber,
    });

    res.json({
      message: "Parcel status updated",
      parcel,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating parcel", error: error.message });
  }
};

export const trackParcel = async (req, res) => {
  try {
    const parcel = await Parcel.findOne({
      trackingNumber: req.params.trackingNumber,
    });
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }
    res.json({ parcel });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error tracking parcel", error: error.message });
  }
};

export const getParcelQRCode = async (req, res) => {
  try {
    const parcel = await Parcel.findById(req.params.id);

    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }

    // Check if user is authorized (customer who owns it or agent assigned to it)
    if (
      req.user.role === "customer" &&
      parcel.customerId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    if (!parcel.qrCode) {
      return res
        .status(404)
        .json({ message: "QR code not generated for this parcel" });
    }

    res.json({
      trackingNumber: parcel.trackingNumber,
      qrCode: parcel.qrCode,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching QR code", error: error.message });
  }
};
