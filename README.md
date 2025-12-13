# Chat Application

A full-stack chat application with a clean MVC backend and a simple Vite + TypeScript frontend. Built for learning purposes and resume projects.

## 🎯 Features

### Backend
- **MVC Architecture**: Clean separation of concerns with Models, Controllers, and Services
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Friend System**: Users must send and accept friend requests before chatting
- **Persistent Messages**: All messages stored in MongoDB with full history
- **Webhooks**: Configurable webhook triggered on new messages
- **RESTful API**: Well-structured API endpoints

### Frontend
- **Modern UI**: Clean, responsive design with gradient backgrounds
- **Real-time Updates**: Polling-based message updates (3-second intervals)
- **Friend Management**: Send, accept, and reject friend requests
- **Chat Interface**: Message history with auto-scroll and timestamp display
- **User Search**: Find and add friends

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd chatApp
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (or use the existing one):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=dev_secret_key_12345_change_in_production
JWT_EXPIRES_IN=7d
WEBHOOK_URL=http://localhost:3001/webhook
```

Start the backend:

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file (or use the existing one):

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

### 4. MongoDB Setup

Make sure MongoDB is running:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud) by updating MONGODB_URI in backend/.env
```

## 📖 Application Workflow

### 1. User Registration & Login
- Register with username, email, and password
- Login to receive a JWT token
- Token is stored in localStorage

### 2. Friend Requests
- Search for users by username or email
- Send friend requests
- Accept or reject incoming requests
- **Important**: You must be friends before you can chat

### 3. Conversations
- When a friend request is accepted, a private conversation is automatically created
- View all conversations in the chat list
- See last message preview

### 4. Messaging
- Open a conversation to see message history
- Send messages in real-time
- Messages persist across sessions
- Auto-polling fetches new messages every 3 seconds

### 5. Webhook
- Every new message triggers a webhook POST request
- Configure webhook URL in backend `.env`
- Useful for integrations (e.g., logging, notifications)

## 🛠 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - List all users (search with `?q=query`)
- `GET /api/users/me` - Get current user profile

### Friends
- `POST /api/friends/request` - Send friend request
- `GET /api/friends/requests` - Get incoming friend requests
- `POST /api/friends/accept` - Accept friend request
- `POST /api/friends/reject` - Reject friend request
- `GET /api/friends/list` - Get friends list

### Conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations` - Get all user's conversations
- `GET /api/conversations/:id/messages` - Get messages (with pagination)

### Messages
- `POST /api/messages` - Send a message

## 🏗 Project Structure

### Backend
```
backend/
├── src/
│   ├── config/          # Database, env configuration
│   ├── models/          # Mongoose schemas
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   ├── middlewares/     # Auth, error handling
│   ├── utils/           # JWT helpers
│   ├── app.ts          # Express app
│   └── server.ts       # Entry point
├── .env
├── package.json
└── tsconfig.json
```

### Frontend
```
frontend/
├── src/
│   ├── api/            # API client layer
│   ├── pages/          # UI pages
│   ├── main.ts         # App entry point
│   └── style.css       # Styles
├── index.html
├── package.json
└── tsconfig.json
```

## 🔒 Security Features

- Password hashing with bcrypt (10 rounds)
- JWT-based authentication
- Protected routes (all except auth endpoints)
- Input validation
- Error handling

## 🎨 Frontend Features

- Clean, modern UI with gradient backgrounds
- Responsive design
- Real-time message updates via polling
- Auto-scroll to latest messages
- Search functionality
- Tab-based navigation

## 🧪 Testing

### Manual Testing Flow

1. **Register two users** (e.g., Alice and Bob)
2. **Login as Alice**
3. **Go to Friends** → Find Bob → Send friend request
4. **Logout and login as Bob**
5. **Go to Friends** → Requests tab → Accept Alice's request
6. **Go to Chat List** → See conversation with Alice
7. **Open conversation** → Send messages
8. **Refresh page** → Messages persist
9. **Login as Alice** → See Bob's messages (after polling interval)

### API Testing with curl

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@test.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"password123"}'

# Get users (with token)
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📝 Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRES_IN` - Token expiration (e.g., "7d")
- `WEBHOOK_URL` - URL to POST new message events

### Frontend (.env)
- `VITE_API_URL` - Backend API URL

## 🚧 Future Enhancements

- WebSocket for real-time messaging (replace polling)
- File/image sharing
- Group chat creation from UI
- Online/offline status
- Read receipts
- Message notifications
- Profile pictures
- Message search
- Email verification

## 📄 License

MIT License - Feel free to use this for your resume or learning!

## 🤝 Contributing

This is a personal learning project, but feel free to fork and customize!

---

**Built with ❤️ for learning and resume building**
