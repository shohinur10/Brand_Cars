# 🚀 FileCloud - Modern File Management System

A beautiful, secure, and modern file management system built with Node.js, Express, and SQLite. Features JWT authentication, drag-and-drop file uploads, and a responsive design.

![FileCloud](https://img.shields.io/badge/FileCloud-Modern%20File%20Management-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![Database](https://img.shields.io/badge/Database-SQLite-orange)
![Authentication](https://img.shields.io/badge/Auth-JWT-red)

## ✨ Features

### 🔐 **Authentication System**
- **JWT Access Tokens** (10 minutes validity)
- **Refresh Tokens** (7 days validity)
- **Multi-device Support** - logout from one device doesn't affect others
- **Password Hashing** with bcrypt
- **Token Blacklisting** on logout
- **Email/Phone Registration** and login

### 📁 **File Management**
- **Drag & Drop Upload** interface
- **File CRUD Operations** (Create, Read, Update, Delete)
- **Pagination** for file listing
- **File Metadata** storage (name, size, type, upload date)
- **Local File Storage** with database tracking
- **File Download** with proper headers
- **File Update/Replace** functionality

### 🎨 **Modern UI/UX**
- **Responsive Design** - works on desktop, tablet, and mobile
- **Beautiful Landing Page** with animations
- **Modern Authentication Forms** with smooth transitions
- **Interactive Dashboard** with file management
- **Real-time Notifications** for user feedback
- **Smooth Animations** and hover effects

### 🛠 **Technical Features**
- **CORS Enabled** for cross-origin requests
- **Error Handling** with comprehensive error responses
- **Input Validation** and sanitization
- **File Size Limits** (10MB configurable)
- **SQLite Database** with proper schema
- **RESTful API** design

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Plans-master
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   npm start
   # or
   node server.js
   ```

5. **Access the application**
   - **Landing Page**: http://localhost:3004
   - **Authentication**: http://localhost:3004/auth
   - **Dashboard**: http://localhost:3004/dashboard (after login)

## 📱 User Interface

### 🏠 **Landing Page**
- Beautiful hero section with gradient background
- Feature showcase with animated cards
- Statistics section
- Call-to-action buttons
- Responsive design for all devices

### 🔐 **Authentication Page**
- Modern login/signup forms
- Smooth form transitions
- Real-time validation
- Error/success notifications
- Auto-redirect after successful authentication

### 📊 **Dashboard**
- Clean, modern file management interface
- Drag & drop upload area
- File grid with hover effects
- Pagination controls
- File actions (download, update, delete)
- Real-time notifications

## 🔧 API Endpoints

### Authentication
- `POST /signup` - User registration
- `POST /signin` - User login
- `POST /signin/new_token` - Refresh access token
- `GET /info` - Get user information
- `GET /logout` - Logout and blacklist token

### File Management
- `POST /file/upload` - Upload new file
- `GET /file/list` - List files with pagination
- `GET /file/:id` - Get file information
- `GET /file/download/:id` - Download file
- `PUT /file/update/:id` - Update/replace file
- `DELETE /file/delete/:id` - Delete file

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Files Table
```sql
CREATE TABLE files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  extension TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Tokens Tables
- `refresh_tokens` - Store refresh tokens with expiration
- `blacklisted_tokens` - Store blacklisted access tokens

## 🎨 Design Features

### **Color Scheme**
- **Primary**: Gradient from #667eea to #764ba2
- **Background**: #f8fafc (light gray)
- **Text**: #334155 (dark gray)
- **Success**: #10b981 (green)
- **Error**: #ef4444 (red)

### **Typography**
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800
- **Responsive**: Scales appropriately on all devices

### **Components**
- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Clean inputs with focus states
- **Notifications**: Slide-in notifications with auto-dismiss

## 📱 Responsive Design

### **Breakpoints**
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### **Mobile Features**
- Touch-friendly interface
- Optimized file upload
- Collapsible navigation
- Swipe gestures support

## 🔒 Security Features

- **JWT Authentication** with short-lived access tokens
- **Refresh Token Rotation** for enhanced security
- **Password Hashing** with bcrypt (10 salt rounds)
- **Input Validation** and sanitization
- **CORS Configuration** for cross-origin requests
- **File Type Validation** and size limits
- **SQL Injection Protection** with parameterized queries

## 🧪 Testing

Run the comprehensive test suite:

```bash
node test_endpoints.js
```

This will test all authentication and file management endpoints.

## 📁 Project Structure

```
Plans-master/
├── app.js                 # Main application with all routes
├── server.js              # Server startup and database initialization
├── config/
│   └── database.js        # SQLite database configuration
├── middleware/
│   ├── auth.js           # JWT authentication middleware
│   └── upload.js         # File upload configuration
├── views/
│   ├── landing.ejs       # Beautiful landing page
│   ├── index.ejs         # Authentication page
│   ├── dashboard.ejs     # File management dashboard
│   ├── author.ejs        # Legacy author page
│   └── reja.ejs          # Legacy plans page
├── uploads/              # File storage directory
├── database.sqlite       # SQLite database file
├── test_endpoints.js     # Comprehensive test suite
├── API_DOCUMENTATION.md  # Complete API documentation
└── README.md            # This file
```

## 🚀 Deployment

### **Environment Variables**
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=plans_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_EXPIRES_IN=10m
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=3004
NODE_ENV=production

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

### **Production Considerations**
- Use environment variables for secrets
- Set up proper logging
- Configure reverse proxy (nginx)
- Set up SSL/TLS certificates
- Configure file storage (AWS S3, etc.)
- Set up database backups

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🎯 Roadmap

- [ ] File sharing with public links
- [ ] File versioning
- [ ] Advanced search and filtering
- [ ] File preview functionality
- [ ] Bulk operations
- [ ] API rate limiting
- [ ] User roles and permissions
- [ ] File encryption
- [ ] Cloud storage integration

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the test suite for usage examples

---

**Built with ❤️ using modern web technologies**

*FileCloud - Where security meets simplicity*

