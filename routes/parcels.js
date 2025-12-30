import express from "express";
import { authMiddleware, roleCheck } from "../middleware/auth.js";
import {
  bookParcel,
  getParcelsByCustomer,
  getParcelById,
  updateParcelStatus,
  trackParcel,
  getParcelQRCode, // Added QR code endpoint
} from "../controllers/parcelController.js";

const router = express.Router();

router.post("/book", authMiddleware, roleCheck(["customer"]), bookParcel);
router.get(
  "/my-parcels",
  authMiddleware,
  roleCheck(["customer"]),
  getParcelsByCustomer
);
router.get("/:id", authMiddleware, getParcelById);
router.patch("/:id/status", authMiddleware, updateParcelStatus);
router.get("/track/:trackingNumber", trackParcel);
router.get("/:id/qr-code", authMiddleware, getParcelQRCode); // Added QR code route

export default router;
