# Digital Warranty & Bill Vault

A comprehensive smart receipt and warranty management system built with Node.js, TypeScript, React, and PostgreSQL.

## 🎯 Overview

Digital Warranty & Bill Vault is a personal smart vault that helps you organize, track, and manage your purchase receipts and warranty information. With advanced OCR technology, smart categorization, and automated notifications, never lose track of important purchase information again.

## ✨ Features

### Core Features
- **🔐 User Authentication**: Secure registration/login with JWT tokens
- **📄 Smart Bill Upload**: Support for PDF, JPG, PNG file formats  
- **🔍 OCR Integration**: Automatic text extraction from receipts using Tesseract.js
- **🏷️ Auto Categorization**: Smart categorization of bills by product type and vendor
- **⏰ Warranty Tracking**: Track warranty expiration dates with automated reminders
- **📊 Dashboard**: Comprehensive overview with statistics and insights
- **🔎 Advanced Search**: Filter by date, category, amount, warranty status, and more
- **🔗 Bill Sharing**: Share bills securely with others
- **📱 Responsive Design**: Works seamlessly across all devices

### Smart Features
- **Enhanced OCR**: Improved receipt parsing for vendor names, dates, amounts, and items
- **Intelligent Categorization**: Automatic categorization using vendor patterns and keywords
- **Warranty Notifications**: Email reminders at 30, 7, and 1 day before expiry
- **Monthly Analytics**: Track spending patterns and category distribution
- **Secure File Storage**: Safe and organized file management

## 🛠️ Technology Stack

### Backend
- **Node.js** + **TypeScript** for robust server-side development
- **Express.js** for REST API framework
- **PostgreSQL** for reliable data storage
- **TypeORM** for database management and migrations
- **Tesseract.js** for OCR text extraction
- **Nodemailer** for email notifications
- **Node-cron** for scheduled tasks
- **JWT** for secure authentication
- **Winston** for comprehensive logging

### Frontend
- **React 18** with **TypeScript** for type-safe UI development
- **React Router** for navigation
- **Tailwind CSS** for modern, responsive styling
- **Framer Motion** for smooth animations
- **Axios** for API communication
- **React Hot Toast** for user notifications

### Development Tools
- **Concurrently** for running both backend and frontend
- **Jest** for testing
- **ESLint** for code quality

## 🚀 Getting Started

### Prerequisites
- **Node.js 16+** - [Download here](https://nodejs.org/)
- **PostgreSQL 12+** - [Download here](https://www.postgresql.org/download/)
- **npm** (comes with Node.js) or **yarn**
- **Git** for cloning the repository

### Quick Start (For Development)

```bash
# 1. Clone and navigate to project
git clone https://github.com/TandelPriyanshi/E-Wallet
cd ewallet

# 2. Install all dependencies (backend + frontend)
npm run install-all

# 3. Create PostgreSQL database
createdb ewallet

# 4. Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# 5. Start both servers
npm run dev
```

### Detailed Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/TandelPriyanshi/E-Wallet
   cd ewallet
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```
   
   This command installs dependencies for:
   - Root project (concurrently)
   - Backend (Node.js/TypeScript)
   - Frontend (React/TypeScript)

3. **Set up PostgreSQL database**
   
   **Option A: Using psql command**
   ```bash
   createdb ewallet
   ```
   
   **Option B: Using PostgreSQL client**
   ```sql
   CREATE DATABASE ewallet;
   ```
   
   **Option C: Using GUI tools** (pgAdmin, DBeaver, etc.)
   - Create a new database named `ewallet`

4. **Configure environment variables**
   
   Copy the backend environment file:
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   **Edit `backend/.env` with your settings:**
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_postgres_username
   DB_PASSWORD=your_postgres_password  
   DB_DATABASE=ewallet

   # JWT Secret (use a strong secret for production)
   JWT_SECRET=your_super_secure_jwt_secret_key_here
   JWT_EXPIRES_IN=24h
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Email Configuration (Gmail example)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-gmail-app-password
   
   # File Upload Configuration
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE=5242880
   ```
   
   **📧 Email Setup (Gmail):**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password: [Google App Passwords](https://support.google.com/accounts/answer/185833)
   - Use the app password (not your regular password) in `SMTP_PASS`

5. **Run the application**
   ```bash
   npm run dev
   ```

   This will start both servers:
   - **Backend API:** http://localhost:3001
   - **Frontend App:** http://localhost:3000
   
   The application will automatically open in your browser!

### Alternative Commands

```bash
# Run only backend
npm run server

# Run only frontend  
npm run client

# Install dependencies separately
cd backend && npm install
cd ../frontend && npm install

# Build for production
cd backend && npm run build
cd ../frontend && npm run build
```

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get current user profile

### Bill Management
- `POST /api/bills/upload` - Upload and process a bill
- `GET /api/bills` - Get user's bills
- `GET /api/bills/search` - Advanced bill search with filters
- `GET /api/bills/:id` - Get specific bill details
- `PUT /api/bills/:id` - Update bill information
- `DELETE /api/bills/:id` - Delete a bill
- `GET /api/bills/categories` - Get all available categories
- `POST /api/bills/categorize` - Manually categorize text

### Dashboard & Analytics  
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/categories` - Get category-wise spending stats
- `GET /api/dashboard/warranty` - Get warranty overview

### Bill Sharing
- `POST /api/shared-bills` - Share a bill with another user
- `GET /api/shared-bills` - Get bills shared with/by user

## 💡 Usage Examples

### Uploading a Bill
```javascript
const formData = new FormData();
formData.append('bill', fileInput.files[0]);
formData.append('productName', 'iPhone 13');

const response = await fetch('/api/bills/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Advanced Search
```javascript
const searchParams = {
  category: 'Electronics',
  startDate: '2023-01-01',
  endDate: '2023-12-31',
  minAmount: 100,
  warrantyStatus: 'active',
  page: 1,
  limit: 10
};

const bills = await fetch(`/api/bills/search?${new URLSearchParams(searchParams)}`);
```

## 🗂️ Project Structure

```
ewallet/
├── backend/                 # Node.js/TypeScript backend
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── entities/        # TypeORM database entities  
│   │   ├── services/        # Business logic services
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API route definitions
│   │   ├── migrations/      # Database migrations
│   │   └── utils/           # Utility functions
│   ├── uploads/             # File storage directory
│   └── logs/                # Application logs
├── frontend/                # React/TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── features/        # Feature-specific components
│   │   ├── services/        # API service functions
│   │   └── layouts/         # Page layouts
│   └── public/              # Static assets
└── README.md
```

## 🔧 Configuration

### Environment Variables
See `backend/.env.example` for all available configuration options.

### OCR Configuration
The system uses Tesseract.js for OCR processing. You can adjust OCR parameters in `src/services/ocr.service.ts`.

### Email Templates
Customize email templates in `src/services/email.service.ts` for warranty reminders.

## ✅ First Time Setup Verification

After setup, verify everything works:

1. **Backend Health Check**
   ```bash
   curl http://localhost:3001/health
   ```
   Should return: `{"success": true, "message": "eWallet API is running"}`

2. **Database Connection**
   - Check backend logs for "Database connection established successfully"
   - No error messages about database connections

3. **Frontend Access**
   - Visit http://localhost:3000
   - Should see the Digital Warranty & Bill Vault login page

4. **Create Test Account**
   - Register a new user account
   - Login successfully
   - Access dashboard

## 🧪 Testing

### Manual Testing
1. **User Registration/Login**
   - Create account with valid email
   - Login with credentials
   - Access protected routes

2. **Bill Upload**
   - Upload a receipt image (JPG/PNG) or PDF
   - Verify OCR text extraction
   - Check automatic categorization

3. **Dashboard Features**
   - View spending statistics
   - Check category distribution
   - Verify warranty tracking

### Running Tests
```bash
# Run backend tests
cd backend && npm test

# Run frontend tests  
cd frontend && npm test
```

## 🚀 Deployment

### Production Build
```bash
# Build backend
cd backend
npm run build
npm start

# Build frontend
cd frontend
npm run build
# Serve build files with nginx/apache
```

### Environment Configuration
- Update `backend/.env` with production values
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure production database
- Set up proper SMTP service

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:5432
   ```
   **Solutions:**
   - Ensure PostgreSQL is running: `pg_ctl status`
   - Start PostgreSQL: `brew services start postgresql` (macOS)
   - Verify database credentials in `.env`
   - Check if database exists: `psql -l | grep ewallet`

2. **Port Already in Use**
   ```
   Error: listen EADDRINUSE :::3001
   ```
   **Solutions:**
   - Kill existing process: `lsof -ti:3001 | xargs kill -9`
   - Use different port in `.env`

3. **OCR Not Working**
   **Solutions:**
   - Ensure good image quality (clear text, good lighting)
   - Check supported formats: JPG, PNG, PDF only
   - Verify file size under 5MB
   - Check backend logs for OCR errors

4. **Email Notifications Not Sending**
   **Solutions:**
   - Verify Gmail 2FA is enabled
   - Use App Password, not regular password
   - Check spam/junk folder
   - Test SMTP settings with online tools

5. **Frontend Build Issues**
   **Solutions:**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Clear React cache: `npm start -- --reset-cache`

### Debug Mode
```bash
# Enable detailed logging
export NODE_ENV=development

# Check backend logs
tail -f backend/logs/combined.log

# Database query logging (check backend logs)
# OCR processing logs (check console output)
```

## 🎯 Feature Walkthrough

### 1. Getting Started
1. **Register Account**: Create your secure account
2. **Dashboard Overview**: View your spending summary and warranty alerts
3. **Upload First Bill**: Drag & drop a receipt to see OCR in action

### 2. Bill Management Workflow
```
📱 Upload Receipt → 🤖 OCR Processing → 🏷️ Auto-Categorization → 📊 Dashboard Update
```

**Step by Step:**
1. **Upload**: Drop PDF/image file or click to browse
2. **OCR Magic**: System extracts vendor, date, amount, items
3. **Smart Categories**: Automatically sorted (Electronics, Food, etc.)
4. **Manual Edit**: Fine-tune details, add warranty info
5. **Track & Search**: Find bills instantly with advanced filters

### 3. Warranty Tracking
- **Set Purchase Date & Warranty Period**: When uploading
- **Automatic Reminders**: Email alerts before expiry
- **Dashboard Widgets**: Quick view of expiring warranties
- **Search by Status**: Find active/expiring/expired warranties

### 4. Dashboard Analytics
- **Spending Overview**: Total, monthly, category breakdown
- **Visual Charts**: Category distribution, monthly trends
- **Quick Stats**: Bills this month/week, average amounts
- **Warranty Status**: Count of active, expiring, expired items

### 5. Advanced Search & Filters
**Filter Options:**
- 📅 Date ranges (purchase date, upload date)
- 🏷️ Categories (Electronics, Food, etc.)
- 💰 Amount ranges (min/max spending)
- ⚠️ Warranty status (active, expiring, expired)
- 🏪 Vendor names
- 📄 Product names

**Search Features:**
- 🔍 Full-text search across all bill content
- 📄 Pagination for large bill collections
- 🔄 Sorting by date, amount, category
- 📊 Results count and filtering summary

## 📈 Features in Detail

### Smart Categorization
The system automatically categorizes bills using:
- **Vendor Recognition**: Identifies major retailers and services
- **Keyword Analysis**: Scans for product-related terms
- **Pattern Matching**: Uses intelligent algorithms for classification
- **9 Main Categories**: Electronics, Home & Garden, Clothing, Food & Beverages, Health & Beauty, Automotive, Books & Media, Services, Other
- **Confidence Scoring**: Shows categorization accuracy

### OCR Processing
Enhanced OCR capabilities include:
- **Multi-format Support**: PDF, JPG, PNG processing
- **Smart Text Parsing**: Extracts vendor names, dates, amounts
- **Item Detection**: Identifies individual purchased items
- **Enhanced Patterns**: Better recognition for various receipt formats
- **Error Handling**: Robust processing with fallback options
- **Automatic Date Parsing**: Handles multiple date formats

### Warranty Management
Comprehensive warranty tracking features:
- **Automatic Calculations**: Determines expiry dates from purchase info
- **Multi-level Reminders**: 30, 7, and 1-day notifications
- **Status Tracking**: Active, expiring, expired categories
- **Email Notifications**: Beautiful HTML email templates
- **Dashboard Integration**: Quick warranty overview
- **Search Integration**: Filter bills by warranty status

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Tesseract.js for OCR capabilities
- The TypeORM team for excellent database management
- React and the amazing community
- All contributors who helped improve this project

---

**Happy organizing! 📋✨**
