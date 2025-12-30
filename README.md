# Courier & Parcel Management System - Frontend

A modern logistics tracking web application built with Next.js 14 and Tailwind CSS.

## 🚀 Live Demo
- **Frontend:** [https://courior-parcel-frontend.vercel.app](https://courior-parcel-frontend.vercel.app)


## 📋 Features
- Customer registration & authentication
- Parcel booking with pickup/delivery addresses
- Real-time parcel tracking with maps
- Booking history and status updates
- Admin dashboard with analytics
- Responsive design for all devices
- Role-based access (Customer, Agent, Admin)

## 🛠️ Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **State Management:** React Context/useState
- **HTTP Client:** Axios/Fetch API
- **Real-time:** Socket.IO client
- **Maps:** Google Maps API
- **Icons:** React Icons

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm/pnpm/yarn
- Backend server running (or use deployed API)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/courier-frontend.git
cd courier-frontend

2. Install Dependencies
bash
npm install
# or
pnpm install
# or
yarn install
3. Environment Variables
Create .env.local file in root directory:

env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
4. Run Development Server
bash
npm run dev
# or
pnpm dev
# or
yarn dev
Open http://localhost:3000 in your browser.

🏗️ Project Structure
frontend/
├── app/                    # Next.js App Router pages
│   ├── (auth)/           # Authentication routes
│   ├── admin/            # Admin pages
│   ├── customer/         # Customer pages
│   ├── agent/            # Delivery agent pages
│   └── layout.js         # Root layout
├── components/           # Reusable components
│   ├── common/          # Shared components
│   ├── ui/              # UI components
│   └── forms/           # Form components
├── contexts/            # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── public/             # Static assets
└── styles/             # Global styles
