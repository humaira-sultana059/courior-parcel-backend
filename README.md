# 📦 Courier Parcel Management System – Backend

This repository contains the **backend API** for a Courier / Parcel Management System built as part of a job task submission. The backend is responsible for authentication, parcel booking & tracking, agent operations, admin controls, and real‑time updates using Socket.IO.

---

## 🚀 Tech Stack

* **Node.js**
* **Express.js**
* **MongoDB (Mongoose)**
* **JWT Authentication**
* **Socket.IO** – real‑time tracking & notifications
* **dotenv** – environment configuration
* **CORS** – cross‑origin support

---

## 👥 User Roles

The system supports **role‑based access control (RBAC)**:

* **Admin** – Dashboard metrics, user & parcel management, agent assignment
* **Agent** – Pickup & delivery scanning, live location updates, delivery completion
* **Customer** – Parcel booking, tracking, QR code generation

---

## 📂 Project Structure

```
backend/
│── config/
│   └── database.js
│
│── controllers/
│   ├── authController.js
│   ├── adminController.js
│   ├── agentController.js
│   └── parcelController.js
│
│── middleware/
│   └── auth.js
│
│── routes/
│   ├── auth.js
│   ├── admin.js
│   ├── agents.js
│   └── parcels.js
│
│── .env
│── server.js
│── package.json
└── README.md
```

---

## 🔐 Authentication

* JWT‑based authentication
* Tokens are required for all protected routes
* Role validation via middleware

### Auth Routes

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | Register new user |
| POST   | `/api/auth/login`    | Login & get JWT   |

---

## 📦 Parcel Routes

| Method | Endpoint                             | Role     | Description             |
| ------ | ------------------------------------ | -------- | ----------------------- |
| POST   | `/api/parcels/book`                  | Customer | Book a parcel           |
| GET    | `/api/parcels/my-parcels`            | Customer | View own parcels        |
| GET    | `/api/parcels/:id`                   | Auth     | Get parcel by ID        |
| PATCH  | `/api/parcels/:id/status`            | Auth     | Update parcel status    |
| GET    | `/api/parcels/track/:trackingNumber` | Public   | Track parcel            |
| GET    | `/api/parcels/:id/qr-code`           | Auth     | Generate parcel QR code |

---

## 🚚 Agent Routes

| Method | Endpoint                         | Description           |
| ------ | -------------------------------- | --------------------- |
| GET    | `/api/agents/assigned`           | View assigned parcels |
| POST   | `/api/agents/scan-pickup`        | Scan QR for pickup    |
| POST   | `/api/agents/scan-delivery`      | Scan QR for delivery  |
| PATCH  | `/api/agents/:parcelId/location` | Update live location  |
| PATCH  | `/api/agents/:parcelId/complete` | Complete delivery     |

---

## 🛠 Admin Routes

| Method | Endpoint                  | Description            |
| ------ | ------------------------- | ---------------------- |
| GET    | `/api/admin/metrics`      | Dashboard analytics    |
| GET    | `/api/admin/users`        | Get all users          |
| GET    | `/api/admin/parcels`      | Get all parcels        |
| POST   | `/api/admin/assign-agent` | Assign agent to parcel |

---

## 📡 Real‑Time Features (Socket.IO)

* Live parcel location tracking
* Real‑time status updates
* Agent assignment notifications
* Delivery completion alerts
* Admin broadcast announcements

### Socket Events

* `join-tracking`
* `location-update`
* `status-update`
* `parcel-booked`
* `agent-assigned`
* `delivery-completed`

---

## 🧪 Health Check

```
GET /api/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
FRONTEND_URL=http://localhost:3000

GOOGLE_MAPS_API_KEY=your_google_maps_key

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
EMAIL_FROM=your_email

TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp
MY_WHATSAPP_NUMBER=your_number
```

⚠️ **Never commit real credentials to GitHub**

---

## ▶️ Run Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Server will run on:

```
http://localhost:5000
```

---

## 🧩 Frontend Integration

This backend is designed to work with a **React / Next.js frontend** and supports:

* JWT authentication headers
* Real‑time tracking via Socket.IO
* QR code scanning for pickup & delivery

---

## 📌 Notes for Reviewer

* Clean modular architecture
* Role‑based access control
* Real‑time features implemented
* Production‑ready structure

---

## 👤 Author

**Humaira Sultana**
MERN stack Developer

---

✅ *Submitted as part of a technical job task*
