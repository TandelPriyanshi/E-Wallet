import dotenv from "dotenv";

dotenv.config();

export const config = {
    // Database Configuration
    database: {
        database: process.env.DB_DATABASE || "database.sqlite",
    },

    // JWT Configuration
    jwt: {
        secret: process.env.JWT_SECRET || "your_jwt_secret",
        expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    },

    // Server Configuration
    server: {
        port: parseInt(process.env.PORT || "3001"),
        env: process.env.NODE_ENV || "development",
    },

    // Email Configuration
    email: {
        host: process.env.SMTP_HOST || "smtp.ethereal.email",
        port: parseInt(process.env.SMTP_PORT || "587"),
        user: process.env.SMTP_USER || "abagail.weber@ethereal.email",
        pass: process.env.SMTP_PASS || "tGqHkCjH8M5d2mWm3V",
    },

    // File Upload Configuration
    upload: {
        dir: process.env.UPLOAD_DIR || "uploads",
        maxSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB default
    },
};
