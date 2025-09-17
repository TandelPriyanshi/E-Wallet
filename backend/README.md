# eWallet Backend API

A comprehensive backend service for digital bill and warranty management built with Node.js, TypeScript, Express, and PostgreSQL.

## 🚀 Features

### Core Functionality
- **User Authentication**: JWT-based secure authentication
- **Bill Management**: Upload, view, edit, delete, and search bills
- **OCR Processing**: Automatic text extraction from bill images using Tesseract.js
- **Warranty Tracking**: Automatic warranty expiration reminders via email
- **File Management**: Secure file upload and storage

### Security & Performance
- **Helmet.js**: Security headers and protection
- **CORS**: Cross-origin request handling
- **Rate Limiting**: API rate limiting protection
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Centralized error management
- **Logging**: Structured logging with Winston

### Quality of Life
- **TypeScript**: Full type safety
- **Environment Configuration**: Configurable via environment variables
- **Automated Cron Jobs**: Warranty reminder scheduling
- **Health Check**: API health monitoring endpoint

## 📋 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user info

### Bill Management
- `POST /api/bills/upload` - Upload a bill with OCR processing
- `GET /api/bills` - Get all user's bills
- `GET /api/bills/:id` - Get specific bill
- `PUT /api/bills/:id` - Update bill details
- `DELETE /api/bills/:id` - Delete bill
- `GET /api/bills/search` - Search bills with filters

### System
- `GET /health` - Health check endpoint

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eWallet/backend/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```bash
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_db_user
   DB_PASSWORD=your_db_password
   DB_DATABASE=ewallet

   # JWT Configuration
   JWT_SECRET=your_super_secure_jwt_secret_key_here
   JWT_EXPIRES_IN=24h

   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Email Configuration (for warranty reminders)
   SMTP_HOST=smtp.ethereal.email
   SMTP_PORT=587
   SMTP_USER=your_email@domain.com
   SMTP_PASS=your_password

   # File Upload Configuration
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE=5242880
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb ewallet
   ```

5. **Start the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   ```

## 🏗️ Architecture

### Project Structure
```
src/
├── config/           # Configuration management
├── controllers/      # Request handlers
├── dtos/            # Data transfer objects
├── entities/        # TypeORM entities
├── middleware/      # Custom middleware
├── routes/          # API routes
├── services/        # Business logic services
└── utils/           # Utility functions
```

### Key Components

#### Configuration Management (`src/config/`)
- Centralized environment variable management
- Type-safe configuration with defaults

#### Controllers (`src/controllers/`)
- **UserController**: Authentication and user management
- **BillController**: Bill CRUD operations with OCR

#### Middleware (`src/middleware/`)
- **Auth**: JWT authentication
- **Validation**: Request validation using class-validator
- **Error Handling**: Centralized error management

#### Services (`src/services/`)
- **Email Service**: Warranty reminder emails with HTML templates
- **Cron Service**: Automated warranty expiration checking

#### DTOs (`src/dtos/`)
- Input validation schemas using class-validator
- Type-safe request/response objects

## 🔒 Security Features

### Authentication & Authorization
- JWT tokens with configurable expiration
- Password hashing using bcrypt (12 rounds)
- Protected routes requiring authentication

### Input Security
- Request validation using class-validator
- File type restrictions (JPEG, PNG, PDF only)
- File size limits
- SQL injection protection via TypeORM

### General Security
- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests/15min in production)
- Secure file serving

## 📊 Monitoring & Logging

### Logging
- Structured JSON logging with Winston
- Separate error and combined logs
- Console logging in development
- Request/response logging

### Health Monitoring
- Health check endpoint at `/health`
- Database connection monitoring
- SMTP connection verification

## 🤖 Automated Features

### Warranty Reminders
- Automatic email reminders at 30, 7, and 1 day before expiry
- Beautifully formatted HTML emails
- Runs daily at 9:00 AM via cron job
- Comprehensive logging and error handling

### File Management
- Automatic cleanup on upload errors
- Organized file naming with timestamps
- Secure file serving

## 🐛 Error Handling

### Comprehensive Error Management
- Centralized error handling middleware
- Standardized API response format
- Environment-specific error details
- Database error translation
- File cleanup on errors

### Response Format
```json
{
  "success": boolean,
  "message": string,
  "data": any,
  "errors": any,
  "timestamp": string
}
```

## 🧪 Development

### Running in Development
```bash
npm run dev
```

### Key Development Features
- Auto-reload with ts-node-dev
- Comprehensive logging
- TypeScript with strict mode
- Database synchronization in development

## 🚀 Production Deployment

### Environment Variables
- Set `NODE_ENV=production`
- Configure secure JWT secret
- Set up proper database credentials
- Configure SMTP for real email service

### Performance Considerations
- File size limits
- Rate limiting
- Database connection pooling
- Log rotation

## 📝 Contributing

1. Follow TypeScript best practices
2. Use meaningful commit messages
3. Add proper error handling
4. Include logging for important operations
5. Validate all inputs
6. Write comprehensive documentation

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection**
   - Check PostgreSQL is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **File Upload Issues**
   - Check `uploads` directory exists and is writable
   - Verify file size limits
   - Check file type restrictions

3. **Email Service**
   - Verify SMTP credentials
   - Check email service configuration
   - Look for email sending logs

### Logs
Check application logs in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

## 📄 License

This project is licensed under the ISC License.
