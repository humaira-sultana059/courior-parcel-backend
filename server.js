import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/auth.js";
import parcelRoutes from "./routes/parcels.js";
import agentRoutes from "./routes/agents.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Connect database
await connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/parcels", parcelRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/admin", adminRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});
// Socket.IO connection handling
const userSockets = new Map(); // Map userId to socket ID

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Store socket connection
  socket.on("user-login", (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} logged in with socket ${socket.id}`);
    socket.emit("connection-confirmed", { socketId: socket.id });
  });

  // Tracking: Customer joins tracking room for a parcel
  socket.on("join-tracking", (parcelId) => {
    socket.join(`parcel-${parcelId}`);
    console.log(`User joined tracking for parcel: ${parcelId}`);
    socket.emit("tracking-joined", {
      parcelId,
      message: "Connected to tracking updates",
    });
  });

  // Tracking: Leave tracking room
  socket.on("leave-tracking", (parcelId) => {
    socket.leave(`parcel-${parcelId}`);
    console.log(`User left tracking for parcel: ${parcelId}`);
  });

  // Agent: Broadcast location update to all users tracking this parcel
  socket.on("location-update", (data) => {
    console.log("[Location Update]", data);
    io.to(`parcel-${data.parcelId}`).emit("location-updated", {
      parcelId: data.parcelId,
      latitude: data.latitude,
      longitude: data.longitude,
      agentId: data.agentId,
      timestamp: new Date(),
    });
  });

  // Status change: Broadcast status update
  socket.on("status-update", (data) => {
    console.log("[Status Update]", data);
    io.to(`parcel-${data.parcelId}`).emit("status-changed", {
      parcelId: data.parcelId,
      status: data.status,
      previousStatus: data.previousStatus,
      agentId: data.agentId,
      timestamp: new Date(),
    });
  });

  // Admin: Broadcast new parcel booking
  socket.on("parcel-booked", (data) => {
    console.log("[Parcel Booked]", data);
    io.emit("new-parcel-booked", {
      parcelId: data.parcelId,
      trackingNumber: data.trackingNumber,
      from: data.pickupCity,
      to: data.deliveryCity,
      timestamp: new Date(),
    });
  });

  // Admin: Broadcast agent assignment
  socket.on("agent-assigned", (data) => {
    console.log("[Agent Assigned]", data);
    io.emit("agent-assigned-notification", {
      parcelId: data.parcelId,
      agentId: data.agentId,
      agentName: data.agentName,
      timestamp: new Date(),
    });

    // Notify the assigned agent
    const agentSocketId = userSockets.get(data.agentId);
    if (agentSocketId) {
      io.to(agentSocketId).emit("parcel-assigned-to-you", {
        parcelId: data.parcelId,
        trackingNumber: data.trackingNumber,
        from: data.pickupCity,
        to: data.deliveryCity,
      });
    }
  });

  // Delivery completed notification
  socket.on("delivery-completed", (data) => {
    console.log("[Delivery Completed]", data);
    io.to(`parcel-${data.parcelId}`).emit("delivery-finished", {
      parcelId: data.parcelId,
      status: data.status,
      completedAt: new Date(),
    });
  });

  // System broadcast: Admin announcement
  socket.on("broadcast-announcement", (data) => {
    console.log("[Announcement]", data);
    io.emit("system-announcement", {
      message: data.message,
      priority: data.priority || "info",
      timestamp: new Date(),
    });
  });

  // Disconnect handling
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Remove from userSockets map
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`Removed user ${userId} from active connections`);
        break;
      }
    }
  });

  // Error handling
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
  );
});

// Export for API testing
export { app, io };
