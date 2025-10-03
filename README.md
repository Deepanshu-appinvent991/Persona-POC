# 🚀 Persona POC - Entity Management System

A comprehensive TypeScript MVC application for managing entity/user data with approval workflows, file uploads, step-by-step creation process, and Redis caching. Features complete **Swagger API documentation** and **automated service management**!

## 📋 Prerequisites

Make sure you have installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Redis** (v6 or higher) - [Download](https://redis.io/download)
- **npm** (comes with Node.js)

## ⚙️ Quick Start

### 1. Install Dependencies

```bash
cd /Users/user/Downloads/POC/persona-poc
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit .env file with your settings (optional - works with defaults)
nano .env
```

### 3. Start Everything (One Command!)

```bash
# Start all services automatically (MongoDB, Redis, Backend)
npm run dev
```

**That's it!** 🎉 The bootstrap system will:
- ✅ Check dependencies
- ✅ Start MongoDB with local data directory
- ✅ Start Redis server
- ✅ Start the backend API with hot reload
- ✅ Display all service URLs

## 🚀 Development Commands

```bash
# 🔥 Start all services (MongoDB + Redis + Backend)
npm run dev

# 🖥️ Start only the backend server (requires MongoDB & Redis running)
npm run dev:all

# 🚀 Manual bootstrap (same as npm run dev)
npm run bootstrap

# 🏗️ Build for production
npm run build

# ▶️ Start production server
npm start

# 🧪 Run tests
npm test

# 🔍 Check code quality
npm run lint

# 🧹 Clean build directory
npm run clean
```

## 🌐 Access URLs

Once services are running, access:

| Service | URL | Description |
|---------|-----|-------------|
| **🏠 Health Check** | `http://localhost:3000/api/health` | Server status |
| **📚 API Documentation** | `http://localhost:3000/api-docs` | Complete Swagger UI |
| **📄 Swagger JSON** | `http://localhost:3000/api-docs.json` | OpenAPI specification |
| **📁 Static Files** | `http://localhost:3000/uploads/` | Uploaded files |

## 📊 Complete API Documentation

### 🔐 Authentication Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me/{userId}` | Get user profile |
| PUT | `/api/auth/profile/{userId}` | Update profile |
| PUT | `/api/auth/change-password/{userId}` | Change password |
| POST | `/api/auth/logout/{userId}` | Logout user |

### 👤 Entity Management

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/entities` | Get all entities (with pagination & filtering) |
| POST | `/api/entities` | Create new entity |
| GET | `/api/entities/{id}` | Get entity by ID |
| PUT | `/api/entities/{id}` | Update entity |
| DELETE | `/api/entities/{id}` | Delete entity (Admin only) |
| PUT | `/api/entities/{id}/approve` | Approve entity |
| PUT | `/api/entities/{id}/reject` | Reject entity |
| GET | `/api/entities/stats` | Get entity statistics |

### 📁 File Management

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/files/profile-photo/{entityId}` | Upload profile photo |
| POST | `/api/files/documents/{entityId}` | Upload documents (max 10) |
| GET | `/api/files/{entityId}` | Get all entity files |
| GET | `/api/files/{entityId}/{filename}` | Download/view file |
| DELETE | `/api/files/{entityId}/{filename}` | Delete file |

### 🚶‍♂️ Step-by-Step Entity Creation

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/step-entities/step1` | Step 1: Basic information |
| POST | `/api/step-entities/{tempId}/step2` | Step 2: Contact information |
| POST | `/api/step-entities/{tempId}/step3` | Step 3: Address information |
| POST | `/api/step-entities/{tempId}/step4` | Step 4: Profile photo |
| POST | `/api/step-entities/{tempId}/step5` | Step 5: Documents |
| POST | `/api/step-entities/{tempId}/step6` | Step 6: Final submission |
| GET | `/api/step-entities/{tempId}/progress` | Get creation progress |
| DELETE | `/api/step-entities/{tempId}/cancel` | Cancel creation process |

### ✅ Approval Workflow

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/approvals/pending` | Get pending entities |
| GET | `/api/approvals/under-review` | Get entities under review |
| GET | `/api/approvals/approved` | Get approved entities |
| GET | `/api/approvals/rejected` | Get rejected entities |

## 🧪 Testing the API

### 1. Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "Password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Create Entity
```bash
curl -X POST http://localhost:3000/api/entities \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "identificationNumber": "ID789456123",
    "email": "jane@example.com",
    "phone": "+12345678901",
    "address": {
      "street": "456 Oak Ave",
      "city": "Los Angeles",
      "state": "CA",
      "country": "USA",
      "postalCode": "90210"
    }
  }'
```

### 3. Get All Entities (with pagination)
```bash
curl "http://localhost:3000/api/entities?page=1&limit=10&status=PENDING"
```

### 4. Step-by-Step Entity Creation
```bash
# Step 1: Basic Information
curl -X POST http://localhost:3000/api/step-entities/step1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Entity",
    "identificationNumber": "TEST123456"
  }'

# Use the tempEntityId from response for next steps...
```

## 🎯 Key Features

- ✅ **Complete Swagger Documentation** - Interactive API explorer
- ✅ **Automated Service Management** - One command starts everything
- ✅ **MongoDB Integration** - Persistent data storage with aggregation
- ✅ **Redis Caching** - 30-minute temporary data storage
- ✅ **File Upload System** - Profile photos and documents
- ✅ **Email Notifications** - Approval/rejection notifications
- ✅ **Step-by-Step Creation** - Multi-page entity creation workflow
- ✅ **Approval Workflow** - Dedicated approval status management
- ✅ **Pagination & Filtering** - Advanced entity querying
- ✅ **TypeScript** - Full type safety throughout
- ✅ **MVC Architecture** - Clean, organized code structure
- ✅ **Real-time Progress** - Track multi-step processes

## 📁 Project Structure

```
persona-poc/
├── src/
│   ├── controllers/           # Request handlers
│   │   ├── authController.ts     # User authentication
│   │   ├── entityController.ts   # Entity CRUD operations
│   │   ├── fileController.ts     # File upload/management
│   │   └── stepEntityController.ts # Step-by-step creation
│   ├── services/             # Business logic layer
│   │   ├── authService.ts       # User operations
│   │   ├── entityService.ts     # Entity operations
│   │   └── emailService.ts      # Email notifications
│   ├── models/              # MongoDB schemas
│   │   ├── User.ts             # User data model
│   │   └── Entity.ts           # Entity data model
│   ├── routes/              # API route definitions
│   │   ├── authRoutes.ts       # Authentication endpoints
│   │   ├── entityRoutes.ts     # Entity CRUD endpoints
│   │   ├── fileRoutes.ts       # File management endpoints
│   │   ├── stepEntityRoutes.ts  # Step creation endpoints
│   │   └── approvalRoutes.ts   # Approval workflow endpoints
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts            # Authentication middleware
│   │   ├── validation.ts      # Request validation
│   │   └── errorHandler.ts    # Error handling
│   ├── config/             # Configuration files
│   │   ├── database.ts        # MongoDB configuration
│   │   ├── redis.ts          # Redis configuration
│   │   └── swagger.ts        # API documentation setup
│   ├── utils/              # Utility functions
│   └── server.ts           # Main server configuration
├── app.ts                  # Application entry point
├── bootstrap.ts           # Service orchestration
├── uploads/              # File storage directory
├── .env                  # Environment variables
└── package.json         # Dependencies and scripts
```

## 🔧 Advanced Configuration

### Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/persona-poc
MONGODB_TEST_URI=mongodb://localhost:27017/persona-poc-test

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
CACHE_TTL=1800

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads/

# Frontend Configuration
FRONTEND_URL=http://localhost:3001
```

## 🔧 Troubleshooting

### Service Issues

```bash
# Check what's running on port 3000
lsof -ti:3000

# Kill process on port 3000
kill -9 $(lsof -ti:3000)

# Check MongoDB status
ps aux | grep mongod

# Check Redis status
redis-cli ping
```

### Database Issues

```bash
# Connect to MongoDB shell
mongosh

# View databases
show dbs

# Use persona-poc database
use persona-poc

# View collections
show collections

# Clear all data (development only!)
db.dropDatabase()
```

### Cache Issues

```bash
# Connect to Redis
redis-cli

# View all keys
KEYS *

# Clear all cache
FLUSHALL

# Clear specific pattern
DEL temp_entity:*
```

### File Upload Issues

```bash
# Check upload directory permissions
ls -la uploads/

# Create upload directories
mkdir -p uploads/photos uploads/documents

# Fix permissions (if needed)
chmod 755 uploads uploads/photos uploads/documents
```

## 🚀 Production Deployment

### 1. Build the Application
```bash
npm run build
```

### 2. Environment Setup
```bash
# Create production environment file
cp .env .env.production

# Update production settings
NODE_ENV=production
MONGODB_URI=mongodb://your-production-server:27017/persona-poc
REDIS_HOST=your-redis-server
```

### 3. Start Production Server
```bash
npm start
```

## 📊 API Testing Examples

### Using the Swagger UI
1. Visit `http://localhost:3000/api-docs`
2. Click "Authorize" if authentication is needed
3. Try out any endpoint directly in the browser
4. View request/response schemas and examples

### Using Postman Collection
The Swagger JSON can be imported into Postman:
1. Download: `http://localhost:3000/api-docs.json`
2. Import into Postman
3. All endpoints will be available with proper documentation

## 🎉 What's Next?

Your Persona POC is now fully set up with:

- 🔥 **One-command startup** - `npm run dev`
- 📚 **Complete API documentation** - Interactive Swagger UI
- 🚀 **All services automated** - MongoDB, Redis, Backend
- 📊 **Full CRUD operations** - Create, read, update, delete entities
- 📁 **File management** - Upload, download, delete files
- ✅ **Approval workflows** - Multi-step approval process
- 🚶‍♂️ **Step-by-step creation** - Guided entity creation
- 📧 **Email notifications** - Automated status updates

**Ready to build amazing applications!** 🌟

Visit `http://localhost:3000/api-docs` to start exploring your API!
