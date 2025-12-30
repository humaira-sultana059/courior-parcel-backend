import express from "express"
import { authMiddleware, roleCheck } from "../middleware/auth.js"
import { getDashboardMetrics, getAllUsers, getAllParcels, assignAgent } from "../controllers/adminController.js"

const router = express.Router()

router.get("/metrics", authMiddleware, roleCheck(["admin"]), getDashboardMetrics)
router.get("/users", authMiddleware, roleCheck(["admin"]), getAllUsers)
router.get("/parcels", authMiddleware, roleCheck(["admin"]), getAllParcels)
router.post("/assign-agent", authMiddleware, roleCheck(["admin"]), assignAgent)

export default router
