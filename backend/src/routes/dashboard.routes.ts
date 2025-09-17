import express from "express";
import {
    getDashboardStats,
    getCategoryStats,
    getWarrantyOverview,
} from "../controllers/dashboard.controller";
import { auth } from "../middleware/auth.middleware";
import { sendWarrantyReminderEmail } from "../services/email.service";

const router = express.Router();

// All dashboard routes require authentication
router.use(auth);

// Dashboard overview with stats
router.get("/stats", getDashboardStats);

// Category statistics
router.get("/categories", getCategoryStats);

// Warranty overview
router.get("/warranty", getWarrantyOverview);

// Test email endpoint
router.post("/test-email", async (req, res) => {
    try {
        const { email, productName, expiryDate } = req.body;

        if (!email || !productName || !expiryDate) {
            return res.status(400).json({
                success: false,
                message: "Email, productName, and expiryDate are required",
            });
        }

        const emailSent = await sendWarrantyReminderEmail(
            email,
            productName,
            expiryDate
        );

        if (emailSent) {
            res.json({
                success: true,
                message:
                    "Test email sent successfully! Check Ethereal inbox for preview URL in logs.",
            });
        } else {
            res.status(500).json({
                success: false,
                message:
                    "Failed to send test email. Check server logs for details.",
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error sending test email",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

export default router;
