# 🍕 FoodDeliver – Full-Stack Food Delivery System

A complete food delivery platform with **Customer**, **Admin**, and **Delivery Agent** roles. Built with React + Vite (frontend), Node.js + Express + Socket.IO (backend), and MongoDB Atlas (database).

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [Vercel](https://fooddeliver-frontend.vercel.app) *(deploy to update)* |
| **Backend API** | [Render](https://fooddeliver-backend.onrender.com) *(deploy to update)* |

## ✨ Features

- 🔐 JWT Authentication + Google OAuth
- 🛒 Browse menu, add to cart, place orders
- 👨‍💼 Admin dashboard – manage foods, orders, assign delivery agents
- 🚚 Delivery agent dashboard – view & update assigned orders
- 📍 Real-time GPS tracking via Socket.IO + Leaflet maps
- ⏱️ Live ETA calculation with Haversine formula
- 🔔 Toast notifications for order & delivery updates
- ☁️ Image uploads via Cloudinary
- 💳 Payment flow integration
- 📱 React Native mobile app (Expo) in `/mobile`

## 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, React Router, Socket.IO Client, Leaflet |
| Backend | Node.js, Express, Socket.IO, Mongoose, Helmet, JWT |
| Database | MongoDB Atlas |
| Storage | Cloudinary |
| Deployment | Render (backend) + Vercel (frontend) |

## 📁 Project Structure

```
FoodDeliverSystem/
├── backend/          # Express + Socket.IO API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── frontend/         # React + Vite SPA
│   └── src/
│       ├── pages/    # customer / admin / delivery pages
│       └── components/
└── mobile/           # React Native (Expo) app
```

## 🚀 Local Development

### Backend
```bash
cd backend
cp .env.example .env   # fill in your secrets
npm install
npm run dev            # runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env   # fill in your API URL
npm install
npm run dev            # runs on http://localhost:5173
```

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRE` | Token expiry (e.g. `7d`) |
| `CLIENT_URL` | Frontend URL (for CORS) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `EMAIL_USER` | SMTP email address |
| `EMAIL_PASS` | SMTP email password/app password |

### Frontend (`frontend/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |
| `VITE_SOCKET_URL` | Backend Socket.IO URL |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key |

## 🛠️ Deployment

- **Backend**: Deployed via `render.yaml` on [Render](https://render.com)
- **Frontend**: Deployed via `vercel.json` on [Vercel](https://vercel.com)

## 📄 License

MIT
