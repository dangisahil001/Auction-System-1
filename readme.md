# 🏷️ Online Auction Platform (MERN Stack)

A production-ready online auction platform built with the MERN stack (MongoDB, Express, React, Node.js) featuring real-time bidding, role-based access control, and automated auction lifecycle management.

---

## 🚀 Tech Stack

**Frontend**
- React 18 with Vite
- React Router DOM v6
- Zustand for state management
- Tailwind CSS for styling
- React Hook Form for forms
- Socket.IO Client
- date-fns for date formatting

**Backend**
- Node.js + Express
- MongoDB with Mongoose
- JWT for authentication
- Socket.IO for real-time communication
- node-cron for scheduled tasks
- express-validator for validation
- multer for file uploads

---

## 🎯 Core Features

### 1. Authentication & Authorization
- User signup/login with bcrypt password hashing
- JWT-based authentication (access + refresh tokens)
- Role-based access control (admin, seller, bidder)
- Protected routes and middleware

### 2. Auction Listing Management
- Full CRUD APIs for auctions
- Support for multiple images per auction
- Categories: electronics, art, collectibles, fashion, home, sports, vehicles, other
- Only sellers can create auctions
- MongoDB indexing for optimized queries

### 3. Bidding System
- Place bids with real-time validation
- Validates: auction is live, bid > currentBid, respects min increment
- Prevents self-bidding
- Persists complete bid history
- Persistent bid history storage

### 4. Real-Time Bidding
- Socket.IO for instant bid updates
- Broadcast highest bid changes to all clients
- Auction-specific socket rooms
- Syncs remaining auction time every second

### 5. Auction Lifecycle Automation
- Automatic status transitions: upcoming → live → ended
- Cron jobs run every minute to check auction statuses
- On auction end: determines winner, locks bidding
- Sends notifications to winner and other bidders

### 6. Notifications System
- In-app notifications for:
  - Outbid events
  - Auction win/loss
  - Auction ending soon (5 min warning)
- Stored in MongoDB
- Real-time delivery via Socket.IO

### 7. Admin Controls
- Admin-only dashboard with statistics
- View all users and auctions
- Ban/unban users
- Update user roles
- Remove auctions

---

## 📁 Project Structure

```
auction-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── AuctionCard.jsx
│   │   │   ├── BidForm.jsx
│   │   │   ├── CountdownTimer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── lib/           # API and socket utilities
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── pages/         # Page components
│   │   │   ├── AdminPage.jsx
│   │   │   ├── AuctionDetailPage.jsx
│   │   │   ├── AuctionsPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── MyAuctionsPage.jsx
│   │   │   ├── MyBidsPage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── store/         # Zustand stores
│   │   │   ├── auctionStore.js
│   │   │   ├── authStore.js
│   │   │   └── notificationStore.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
└── server/                 # Express backend
    ├── src/
    │   ├── config/        # Database and socket config
    │   │   ├── db.js
    │   │   └── socket.js
    │   ├── controllers/   # Route handlers
    │   ├── jobs/          # Cron jobs
    │   │   └── auctionScheduler.js
    │   ├── middleware/    # Auth, validation, error handling
    │   ├── models/        # Mongoose schemas
    │   │   ├── User.js
    │   │   ├── Auction.js
    │   │   ├── Bid.js
    │   │   └── Notification.js
    │   ├── routes/        # API routes
    │   ├── services/      # Business logic
    │   └── validators/    # Request validation rules
    └── package.json
```

---

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd server
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and secrets

npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## ⚙️ Environment Variables

### Server (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/auction-system
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| POST | /api/auth/logout | Logout user |
| POST | /api/auth/refresh-token | Refresh access token |
| GET | /api/auth/profile | Get current user profile |
| PUT | /api/auth/profile | Update profile |
| PUT | /api/auth/change-password | Change password |

### Auctions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/auctions | List auctions (with filters) |
| GET | /api/auctions/:id | Get auction details |
| POST | /api/auctions | Create auction (seller only) |
| PUT | /api/auctions/:id | Update auction |
| DELETE | /api/auctions/:id | Delete auction |
| GET | /api/auctions/:id/bids | Get bid history |
| GET | /api/auctions/categories | Get categories |

### Bids
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/bids/auction/:auctionId | Place bid |
| GET | /api/bids/my-bids | Get user's bids |
| GET | /api/bids/auction/:auctionId/highest | Get highest bid |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | Get notifications |
| GET | /api/notifications/unread-count | Get unread count |
| PUT | /api/notifications/:id/read | Mark as read |
| PUT | /api/notifications/mark-all-read | Mark all as read |
| DELETE | /api/notifications/:id | Delete notification |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard | Get dashboard stats |
| GET | /api/admin/users | List all users |
| GET | /api/admin/users/:id | Get user details |
| POST | /api/admin/users/:id/ban | Ban user |
| POST | /api/admin/users/:id/unban | Unban user |
| PUT | /api/admin/users/:id/role | Update user role |
| GET | /api/admin/auctions | List all auctions |
| DELETE | /api/admin/auctions/:id | Remove auction |

---

## 🔌 Socket Events

### Client → Server
- `join-auction` - Join an auction room
- `leave-auction` - Leave an auction room

### Server → Client
- `bid-update` - New bid placed
- `auction-started` - Auction has started
- `auction-ended` - Auction has ended
- `time-sync` - Remaining time update
- `notification` - New notification

---

## 🚀 Running in Production

```bash
# Build frontend
cd client
npm run build

# Start server
cd server
NODE_ENV=production npm start
```

---

## 📄 License

MIT