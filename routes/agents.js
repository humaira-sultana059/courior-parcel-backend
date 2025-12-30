import express from "express";
import { authMiddleware, roleCheck } from "../middleware/auth.js";
import {
  getAssignedParcels,
  updateDeliveryLocation,
  completeDelivery,
  scanForPickup,
  scanForDelivery, // Added scan-to-deliver import
} from "../controllers/agentController.js";

const router = express.Router();

router.get(
  "/assigned",
  authMiddleware,
  roleCheck(["agent"]),
  getAssignedParcels
);
router.post(
  "/scan-pickup",
  authMiddleware,
  roleCheck(["agent"]),
  scanForPickup
);
router.post(
  "/scan-delivery",
  authMiddleware,
  roleCheck(["agent"]),
  scanForDelivery
); // Added scan-to-deliver route
router.patch(
  "/:parcelId/location",
  authMiddleware,
  roleCheck(["agent"]),
  updateDeliveryLocation
);
router.patch(
  "/:parcelId/complete",
  authMiddleware,
  roleCheck(["agent"]),
  completeDelivery
);

export default router;
