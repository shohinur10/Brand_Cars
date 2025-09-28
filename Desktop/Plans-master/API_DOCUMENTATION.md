# 🚀 Backend API Documentation

## Overview
A fully functional Node.js/Express backend service with JWT authentication and file management capabilities.

**Base URL:** `http://localhost:3004`

## 🔐 Authentication System

### 1. User Registration
**POST** `/signup`

Register a new user with email or phone number.

**Request Body:**
```json
{
  "email": "user@example.com",     // Optional if phone provided
  "phone": "+1234567890",          // Optional if email provided
  "password": "password123"        // Required, min 6 characters
}
```

**Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "phone": "+1234567890"
  }
}
```

### 2. User Login
**POST** `/signin`

Login with email or phone number and password.

**Request Body:**
```json
{
  "email": "user@example.com",     // Optional if phone provided
  "phone": "+1234567890",          // Optional if email provided
  "password": "password123"        // Required
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "phone": "+1234567890"
  }
}
```

### 3. Refresh Token
**POST** `/signin/new_token`

Get new access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. User Info
**GET** `/info`

Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "user_id": 1
}
```

### 5. Logout
**GET** `/logout`

Logout and blacklist current access token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

## 📁 File Management System

### 1. Upload File
**POST** `/file/upload`

Upload a new file (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body:**
```
file: <file_data>
```

**Response (201):**
```json
{
  "id": 1,
  "filename": "document.pdf",
  "size": 1024000,
  "mime_type": "application/pdf",
  "extension": ".pdf",
  "created_at": "2025-09-26T15:41:19.601Z"
}
```

### 2. List Files
**GET** `/file/list`

Get paginated list of user's files (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `list_size` (optional): Items per page (default: 10)

**Example:** `/file/list?page=1&list_size=5`

**Response (200):**
```json
{
  "files": [
    {
      "id": 1,
      "original_name": "document.pdf",
      "mime_type": "application/pdf",
      "file_size": 1024000,
      "extension": ".pdf",
      "created_at": "2025-09-26 15:41:19"
    }
  ],
  "pagination": {
    "page": 1,
    "list_size": 10,
    "total": 1,
    "total_pages": 1
  }
}
```

### 3. Get File Info
**GET** `/file/:id`

Get information about a specific file (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": 1,
  "original_name": "document.pdf",
  "mime_type": "application/pdf",
  "file_size": 1024000,
  "extension": ".pdf",
  "created_at": "2025-09-26 15:41:19",
  "updated_at": "2025-09-26 15:41:19"
}
```

### 4. Download File
**GET** `/file/download/:id`

Download a file (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```
Content-Type: <file_mime_type>
Content-Disposition: attachment; filename="<original_filename>"
Content-Length: <file_size>

<file_binary_data>
```

### 5. Update File
**PUT** `/file/update/:id`

Replace an existing file with a new one (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body:**
```
file: <new_file_data>
```

**Response (200):**
```json
{
  "id": 1,
  "filename": "updated_document.pdf",
  "size": 2048000,
  "mime_type": "application/pdf",
  "extension": ".pdf",
  "updated_at": "2025-09-26T15:41:19.680Z"
}
```

### 6. Delete File
**DELETE** `/file/delete/:id`

Delete a file (requires authentication).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "File deleted successfully"
}
```

## 🔧 Technical Specifications

### Authentication
- **JWT Access Token:** Valid for 10 minutes
- **Refresh Token:** Valid for 7 days
- **Multi-device Support:** Logout from one device doesn't affect others
- **Token Blacklisting:** Access tokens are blacklisted on logout
- **Password Hashing:** bcrypt with salt rounds of 10

### File Management
- **Storage:** Local filesystem in `./uploads` directory
- **Metadata:** Stored in SQLite database
- **File Size Limit:** 10MB (configurable)
- **Supported Types:** All file types
- **Pagination:** Configurable page size

### Database
- **Type:** SQLite (file-based)
- **Location:** `./database.sqlite`
- **Tables:** users, refresh_tokens, blacklisted_tokens, files, plans

### Security
- **CORS:** Enabled for all domains
- **Input Validation:** Request body validation
- **Error Handling:** Comprehensive error responses
- **File Security:** User-specific file access

## 📊 Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## 🚀 Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Server:**
   ```bash
   npm start
   # or
   node server.js
   ```

3. **Server runs on:** `http://localhost:3004`

4. **Test Endpoints:**
   ```bash
   node test_endpoints.js
   ```

## 📝 Environment Variables

Create a `.env` file with:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=plans_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_make_it_long_and_secure
JWT_EXPIRES_IN=10m
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=3004
NODE_ENV=development

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

## ✅ Features Implemented

- ✅ **Authentication System**
  - User registration with email/phone
  - JWT access tokens (10 minutes)
  - Refresh tokens (7 days)
  - Multi-device support
  - Token blacklisting on logout

- ✅ **File Management**
  - File upload with metadata
  - File listing with pagination
  - File download
  - File update/replace
  - File deletion
  - Local file storage

- ✅ **Technical Requirements**
  - Express.js framework
  - SQLite database
  - CORS enabled
  - Password hashing
  - Comprehensive error handling

- ✅ **API Routes**
  - All required authentication endpoints
  - All required file management endpoints
  - Proper HTTP methods and status codes
  - Request/response validation

**🎉 All requirements have been successfully implemented and tested!**

