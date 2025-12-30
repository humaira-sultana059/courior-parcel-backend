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

// Parse multiple URLs from environment variable
const getFrontendUrls = () => {
  // Option 1: Comma-separated list
  if (process.env.FRONTEND_URLS) {
    return process.env.FRONTEND_URLS.split(",").map((url) => url.trim());
  }

  // Option 2: Individual variables
  const urls = [];
  if (process.env.FRONTEND_URL_LOCAL) urls.push(process.env.FRONTEND_URL_LOCAL);
  if (process.env.FRONTEND_URL_IP) urls.push(process.env.FRONTEND_URL_IP);

  // Default fallbacks
  if (urls.length === 0) {
    urls.push("http://localhost:3000", "http://192.168.1.103:3000");
  }

  return urls;
};

const allowedOrigins = [
  ...getFrontendUrls(),
  "http://127.0.0.1:3000", // Also allow 127.0.0.1
];

console.log("✅ Allowed frontend origins:", allowedOrigins);

// Socket.IO configuration
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`⚠️  Blocked origin: ${origin}`);
        console.log(`✅ Allowed origins: ${allowedOrigins.join(", ")}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
});

// Express middleware with CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`❌ Express CORS blocked: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json());
app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${
      req.headers.origin || "No Origin"
    }`
  );
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
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    allowedOrigins,
    socket: "running",
    server: process.env.NODE_ENV || "development",
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Socket.IO connection handling (same as before)
const userSockets = new Map();

io.on("connection", (socket) => {
  console.log(
    "User connected:",
    socket.id,
    "from origin:",
    socket.handshake.headers.origin
  );

  // ... (rest of your socket.io event handlers remain the same)
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

  // ... (rest of your socket event handlers)
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Socket.IO ready for connections`);
  console.log(`✅ Allowed frontend origins:`);
  allowedOrigins.forEach((url) => console.log(`   - ${url}`));
});

// Export for API testing
export { app, io };
