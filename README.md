# 🌊 VividFlow

**The Professional No-Code Canvas Engine**

VividFlow is a high-performance, full-stack website builder designed for speed, precision, and seamless deployment. Built with a robust MERN architecture, it empowers users to create stunning, responsive frontends through an intuitive drag-and-drop interface, backed by a secure and scalable Node.js backend.

---

## 🚀 Key Features

*   **⚡ Core Engine:** A high-speed Drag & Drop builder built from the ground up using advanced React state management. No heavy external visual libraries—just pure, optimized logic.
*   **🧩 Component Library:** A curated set of custom-coded sections (Headers, Heros, Features, Footers) featuring **Live Preview** and **Inline CSS Styling** for pixel-perfect adjustments.
*   **🌐 Deployment & Sharing:** Instant 'Publish' feature to push designs live and an **Export Code** tool to download standard HTML/CSS for local use.
*   **⭐ Full-Stack Feedback:** Integrated Contact API with a dynamic 5-star rating system and persistent storage in MongoDB.
*   **🤖 Real-time Automation:** Instant admin email notifications via **Nodemailer** integration whenever a user submits feedback or ratings.
*   **🔐 Secure Access:** Enterprise-grade security featuring **OTP-based Authentication** and JWT-secured sessions.
*   **📊 Pro Dashboard:** Complete Project CRUD operations (Create, Read, Update, Delete) with custom thumbnails and metadata management.

---

## 🛠️ Technical Stack

### **Frontend**
*   **React 19:** Functional components with Hooks for reactive UI.
*   **Vite:** Ultra-fast build tool for modern web development.
*   **Tailwind CSS:** Utility-first styling for consistent design systems.
*   **Dnd Kit & React RND:** Lightweight logic for canvas manipulation and element resizing.
*   **Axios:** Promise-based HTTP client for seamless API communication.
*   **Lucide React:** High-quality, consistent iconography.

### **Backend**
*   **Node.js & Express 5:** Scalable server-side logic and RESTful API architecture.
*   **MongoDB & Mongoose 9:** NoSQL database for flexible project storage and user data.
*   **Nodemailer:** Automated SMTP integration for real-time alerting.
*   **Passport.js:** Secure authentication middleware with Google OAuth support.
*   **JWT:** Stateless session management for secure cross-origin requests.

---

## ⚙️ Installation & Setup

### **1. Clone the Repository**
```bash
git clone https://github.com/ansshguptaaaa/VividFlow.git
cd VividFlow
```

### **2. Install Dependencies**
```bash
# Root dependencies
npm install

# Client dependencies
cd client && npm install

# Server dependencies
cd ../server && npm install
```

### **3. Environment Config**
Create a `.env` file in the `/server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### **4. Run Locally**
```bash
# From the root directory
npm run dev
```

---

## 📡 API Documentation Overview

### **Authentication**
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/send-otp` | POST | Generates & emails a 6-digit OTP |
| `/api/auth/verify-otp` | POST | Validates OTP & returns a JWT |
| `/api/auth/google` | GET | Initiates Google OAuth Login |

### **Projects**
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/projects` | GET | Fetch all projects for the authenticated user |
| `/api/projects` | POST | Initialize a new canvas project |
| `/api/projects/:id` | PUT | Save canvas state, CSS, and metadata |
| `/api/projects/:id` | DELETE | Permanently remove a project |

### **System & Utility**
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/feedback/submit` | POST | Process ratings and trigger Nodemailer alerts |
| `/api/upload` | POST | Handle asset uploads via Cloudinary |

---

## 📂 Project Structure

```text
VividFlow/
├── client/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── assets/      # Static images and icons
│   │   ├── pages/       # Editor, Dashboard, Auth pages
│   │   ├── utils/       # API services and helpers
│   │   ├── App.jsx      # Root routing
│   │   └── main.jsx     # Entry point
│   └── tailwind.config.js
├── server/              # Backend (Node + Express)
│   ├── config/         # DB and Passport configurations
│   ├── middleware/      # Auth & Error handling
│   ├── models/          # MongoDB Schemas (User, Project)
│   ├── routes/          # API Route Controllers
│   └── server.js        # Server entry point
└── package.json         # Root scripts & dependencies
```

---

## 🛡️ License
Distributed under the ISC License. See `LICENSE` for more information.

---
*Built with passion by Ansh Gupta*
