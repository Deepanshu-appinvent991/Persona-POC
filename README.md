# 🚀 Persona POC - Entity Management System

A simplified TypeScript MVC application for managing entity/user data with approval workflows, file uploads, and Redis caching. **No JWT tokens required** - simple and easy to use!

## 📋 Prerequisites

Make sure you have installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Redis** (v6 or higher) - [Download](https://redis.io/download)
- **npm** (comes with Node.js)

## ⚙️ Installation & Setup

### 1. Install Dependencies

```bash
cd /Users/user/Downloads/POC/persona-poc
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit .env file with your settings
nano .env
```

**Required Environment Variables:**
```env
# Server
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/persona-poc

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads/

# Cache TTL (seconds)
CACHE_TTL=1800
```

### 3. Start Services

You need to run these in **separate terminal windows**:

**Terminal 1 - MongoDB:**
```bash
mongod
```

**Terminal 2 - Redis:**
```bash
redis-server
```

**Terminal 3 - Application:**
```bash
cd /Users/user/Downloads/POC/persona-poc
npm run dev
```

## 🌐 API Endpoints

### 🔐 Authentication (No Tokens Required)

### 📁 File Management

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/files/profile-photo/:entityId` | Upload profile photo |
| POST | `/api/files/documents/:entityId` | Upload documents |
| GET | `/api/files/:entityId` | Get entity files |
| GET | `/api/files/:entityId/:filename` | Download file |
| DELETE | `/api/files/:entityId/:filename` | Delete file |

### 🔄 Step-by-Step Entity Creation

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/step-entities/step1` | Step 1: Basic Info |
| POST | `/api/step-entities/:tempId/step2` | Step 2: Contact Info |
| POST | `/api/step-entities/:tempId/step3` | Step 3: Address |
| POST | `/api/step-entities/:tempId/step4` | Step 4: Profile Photo |
| POST | `/api/step-entities/:tempId/step5` | Step 5: Documents |
| POST | `/api/step-entities/:tempId/step6` | Step 6: Submit |
| GET | `/api/step-entities/:tempId/progress` | Get progress |

## 🧪 Testing the API

### 1. Create Entity
```bash
curl -X POST http://localhost:3000/api/entities \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "identificationNumber": "ID789456123",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "address": {
      "street": "456 Oak Ave",
      "city": "Los Angeles",
      "state": "CA",
      "country": "USA",
      "postalCode": "90210"
    }
  }'
```

### 2. Get All Entities
```bash
curl http://localhost:3000/api/entities
```

### 3. Approve Entity
```bash
curl -X PUT http://localhost:3000/api/entities/ENTITY_ID/approve \
  -H "Content-Type: application/json" \
  -d '{
    "approvalNotes": "All documentation verified"
  }'
```

## 📊 Application URLs

| Service | URL | Description |
|---------|-----|-------------|
| **API Server** | `http://localhost:3000` | Main application |
| **Health Check** | `http://localhost:3000/health` | Server status |
| **API Documentation** | `http://localhost:3000/api-docs` | Swagger UI |
| **Static Files** | `http://localhost:3000/uploads/` | File access |

## 📁 Project Structure

```
src/
├── controllers/           # Request handlers
│   ├── authController.ts     # User management
│   ├── entityController.ts   # Entity CRUD
│   ├── fileController.ts     # File uploads
│   └── stepEntityController.ts # Step-by-step creation
├── services/             # Business logic
│   ├── authService.ts       # User operations
│   ├── entityService.ts     # Entity operations
│   └── emailService.ts      # Email notifications
├── models/              # MongoDB schemas
│   ├── User.ts             # User model
│   └── Entity.ts           # Entity model
├── routes/              # API routes
│   ├── authRoutes.ts       # Auth endpoints
│   ├── entityRoutes.ts     # Entity endpoints
│   ├── fileRoutes.ts       # File endpoints
│   └── stepEntityRoutes.ts  # Step creation
├── middleware/          # Express middleware
├── config/             # Configuration
└── server.ts           # Main server file
```

## 🚀 Development Commands

```bash
# Start development server (auto-reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Check code quality
npm run lint

# Clean build directory
npm run clean
```

## 🎯 Key Features

- ✅ **No JWT Tokens** - Simple userId-based operations
- ✅ **MongoDB Integration** - Persistent data storage
- ✅ **Redis Caching** - 30-minute temporary data storage
- ✅ **File Uploads** - PDF, images, CSV support
- ✅ **Email Notifications** - Approval/rejection emails
- ✅ **Step-by-Step Forms** - Multi-page entity creation
- ✅ **API Documentation** - Swagger UI integration
- ✅ **TypeScript** - Full type safety
- ✅ **MVC Architecture** - Clean code organization

## 🔧 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB manually
mongod --config /usr/local/etc/mongod.conf
```

### Redis Connection Issues
```bash
# Check if Redis is running
redis-cli ping

# Start Redis manually
redis-server
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)
```

### Clear Cache
```bash
# Connect to Redis CLI
redis-cli

# Clear all cache
FLUSHALL
```

## 📝 Example Workflow

1. **Start Services**: MongoDB, Redis, Application
2. **Register User**: Create account via API
3. **Create Entity**: Submit entity data
4. **Upload Files**: Add documents and photos
5. **Review Process**: Approve or reject entities
6. **Email Notifications**: Automatic status updates

## 🎉 You're Ready!

Your simplified Persona POC is now running! Visit `http://localhost:3000/api-docs` to explore the API documentation, or start making API calls directly.

**No tokens, no complexity - just simple REST API calls! 🚀**
