import { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { AppDataSource } from "../data-source";
import { Bill } from "../entities/bill.entity";
import { User } from "../entities/user.entity";
import { config } from "../config/config";
import { ApiResponse } from "../utils/response";
import logger from "../utils/logger";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { ocrService } from "../services/ocr.service";
import { categorizationService } from "../services/categorization.service";

// Ensure upload directory exists
if (!fs.existsSync(config.upload.dir)) {
    fs.mkdirSync(config.upload.dir, { recursive: true });
}

// File filter for allowed file types
const fileFilter = (
    req: any,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG and PNG image files are allowed"));
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, config.upload.dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname +
                "-" +
                uniqueSuffix +
                path.extname(file.originalname)
        );
    },
});

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: config.upload.maxSize,
    },
});

export const uploadBill = [
    upload.single("bill"),
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.file) {
                return ApiResponse.badRequest(res, "No file uploaded");
            }

            const userId = req.user?.id;
            if (!userId) {
                return ApiResponse.unauthorized(res, "User not authenticated");
            }

            logger.info("Processing uploaded bill", {
                userId,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
            });

            const billRepository = AppDataSource.getRepository(Bill);
            const userRepository = AppDataSource.getRepository(User);

            const user = await userRepository.findOne({
                where: { id: userId },
            });
            if (!user) {
                // Clean up uploaded file if user not found
                fs.unlinkSync(req.file.path);
                return ApiResponse.notFound(res, "User not found");
            }

            // Process the bill with enhanced OCR
            const ocrData = await ocrService.processImage(req.file.path);

            // Automatically categorize the bill
            const categoryMatch = categorizationService.categorizeByText(
                ocrData.rawText,
                ocrData.vendorName,
                req.body.productName
            );

            const bill = new Bill();
            bill.filename = req.file.filename;
            bill.path = req.file.path;
            bill.rawText = ocrData.rawText;
            bill.metadata = {
                totalAmount: ocrData.totalAmount,
                date: ocrData.date,
                vendorName: ocrData.vendorName,
                items: ocrData.items,
            };
            bill.category = categoryMatch.category;
            bill.productName =
                req.body.productName || ocrData.vendorName || "Unknown Product";

            // Set purchase date from OCR if available
            if (ocrData.date) {
                try {
                    // Try to parse and format the date
                    const parsedDate = new Date(ocrData.date);
                    if (!isNaN(parsedDate.getTime())) {
                        bill.purchaseDate = parsedDate
                            .toISOString()
                            .split("T")[0];
                    }
                } catch (error) {
                    logger.warn("Failed to parse date from OCR", {
                        date: ocrData.date,
                    });
                }
            }

            bill.user = user;

            const savedBill = await billRepository.save(bill);

            logger.info("Bill uploaded successfully", {
                billId: savedBill.id,
                userId,
            });

            return ApiResponse.success(
                res,
                "Bill uploaded successfully",
                { bill: savedBill },
                201
            );
        } catch (error) {
            // Clean up uploaded file on error
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            logger.error("Error uploading bill:", error);
            next(error);
        }
    },
];

export const getBills = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return ApiResponse.unauthorized(res, "User not authenticated");
        }

        const billRepository = AppDataSource.getRepository(Bill);
        const bills = await billRepository.find({
            where: { user: { id: userId } },
            order: { id: "DESC" },
        });

        logger.info("Bills retrieved successfully", {
            userId,
            count: bills.length,
        });
        return ApiResponse.success(res, "Bills retrieved successfully", {
            bills,
        });
    } catch (error) {
        logger.error("Error retrieving bills:", error);
        next(error);
    }
};

export const getBillById = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return ApiResponse.unauthorized(res, "User not authenticated");
        }

        if (!id || isNaN(parseInt(id))) {
            return ApiResponse.badRequest(res, "Invalid bill ID");
        }

        const billRepository = AppDataSource.getRepository(Bill);
        const bill = await billRepository.findOne({
            where: {
                id: parseInt(id),
            },
            relations: ["user"],
        });

        if (!bill) {
            return ApiResponse.notFound(res, "Bill not found");
        }

        logger.info("Bill retrieved successfully", { billId: bill.id, userId });
        return ApiResponse.success(res, "Bill retrieved successfully", {
            bill,
        });
    } catch (error) {
        logger.error("Error retrieving bill:", error);
        next(error);
    }
};

export const updateBill = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { productName, purchaseDate, warrantyPeriod, notes, category } =
            req.body;

        if (!userId) {
            return ApiResponse.unauthorized(res, "User not authenticated");
        }

        if (!id || isNaN(parseInt(id))) {
            return ApiResponse.badRequest(res, "Invalid bill ID");
        }

        const billRepository = AppDataSource.getRepository(Bill);
        const bill = await billRepository.findOne({
            where: {
                id: parseInt(id),
                user: { id: userId },
            },
        });

        if (!bill) {
            return ApiResponse.notFound(res, "Bill not found");
        }

        // Update only provided fields
        if (productName !== undefined) bill.productName = productName;
        if (purchaseDate !== undefined) bill.purchaseDate = purchaseDate;
        if (warrantyPeriod !== undefined) bill.warrantyPeriod = warrantyPeriod;
        if (notes !== undefined) bill.notes = notes;
        if (category !== undefined) bill.category = category;

        const updatedBill = await billRepository.save(bill);

        logger.info("Bill updated successfully", { billId: bill.id, userId });
        return ApiResponse.success(res, "Bill updated successfully", {
            bill: updatedBill,
        });
    } catch (error) {
        logger.error("Error updating bill:", error);
        next(error);
    }
};

export const searchBills = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return ApiResponse.unauthorized(res, "User not authenticated");
        }

        const {
            productName,
            category,
            startDate,
            endDate,
            minAmount,
            maxAmount,
            warrantyStatus,
            vendorName,
            page = "1",
            limit = "10",
            sortBy = "createdAt",
            sortOrder = "DESC",
        } = req.query;

        const billRepository = AppDataSource.getRepository(Bill);
        const queryBuilder = billRepository
            .createQueryBuilder("bill")
            .where("bill.user_id = :userId", { userId });

        // Product name filter
        if (productName && typeof productName === "string") {
            queryBuilder.andWhere(
                "(LOWER(bill.product_name) LIKE LOWER(:productName) OR LOWER(bill.raw_text) LIKE LOWER(:productName))",
                {
                    productName: `%${productName}%`,
                }
            );
        }

        // Category filter
        if (category && typeof category === "string" && category !== "All") {
            queryBuilder.andWhere("bill.category = :category", { category });
        }

        // Vendor name filter
        if (vendorName && typeof vendorName === "string") {
            queryBuilder.andWhere(
                "(LOWER(bill.metadata) LIKE LOWER(:vendorName) OR LOWER(bill.raw_text) LIKE LOWER(:vendorName))",
                {
                    vendorName: `%${vendorName}%`,
                }
            );
        }

        // Date range filter
        if (startDate && typeof startDate === "string") {
            queryBuilder.andWhere("bill.purchase_date >= :startDate", {
                startDate,
            });
        }
        if (endDate && typeof endDate === "string") {
            queryBuilder.andWhere("bill.purchase_date <= :endDate", {
                endDate,
            });
        }

        // Amount range filter
        if (minAmount && typeof minAmount === "string") {
            queryBuilder.andWhere(
                "CAST(bill.metadata->'totalAmount' AS DECIMAL) >= :minAmount",
                {
                    minAmount: parseFloat(minAmount),
                }
            );
        }
        if (maxAmount && typeof maxAmount === "string") {
            queryBuilder.andWhere(
                "CAST(bill.metadata->'totalAmount' AS DECIMAL) <= :maxAmount",
                {
                    maxAmount: parseFloat(maxAmount),
                }
            );
        }

        // Warranty status filter
        if (warrantyStatus && typeof warrantyStatus === "string") {
            const today = new Date().toISOString().split("T")[0];

            switch (warrantyStatus) {
                case "active":
                    queryBuilder.andWhere(
                        "bill.purchase_date IS NOT NULL AND bill.warranty_period IS NOT NULL AND " +
                            "DATE(bill.purchase_date + INTERVAL ' ' || bill.warranty_period || ' months') > :today",
                        { today }
                    );
                    break;
                case "expired":
                    queryBuilder.andWhere(
                        "bill.purchase_date IS NOT NULL AND bill.warranty_period IS NOT NULL AND " +
                            "DATE(bill.purchase_date + INTERVAL ' ' || bill.warranty_period || ' months') <= :today",
                        { today }
                    );
                    break;
                case "expiring_soon":
                    const nextMonth = new Date();
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    const nextMonthStr = nextMonth.toISOString().split("T")[0];

                    queryBuilder.andWhere(
                        "bill.purchase_date IS NOT NULL AND bill.warranty_period IS NOT NULL AND " +
                            "DATE(bill.purchase_date + INTERVAL ' ' || bill.warranty_period || ' months') > :today AND " +
                            "DATE(bill.purchase_date + INTERVAL ' ' || bill.warranty_period || ' months') <= :nextMonth",
                        { today, nextMonth: nextMonthStr }
                    );
                    break;
                case "no_warranty":
                    queryBuilder.andWhere(
                        "(bill.purchase_date IS NULL OR bill.warranty_period IS NULL)"
                    );
                    break;
            }
        }

        // Sorting
        const validSortFields = [
            "createdAt",
            "purchaseDate",
            "productName",
            "category",
        ];
        const sortField = validSortFields.includes(sortBy as string)
            ? (sortBy as string)
            : "createdAt";
        const order = sortOrder === "ASC" ? "ASC" : "DESC";

        queryBuilder.orderBy(
            `bill.${
                sortField === "createdAt"
                    ? "created_at"
                    : sortField === "purchaseDate"
                    ? "purchase_date"
                    : sortField === "productName"
                    ? "product_name"
                    : "category"
            }`,
            order
        );

        // Pagination
        const pageNum = parseInt(page as string) || 1;
        const limitNum = Math.min(parseInt(limit as string) || 10, 100); // Max 100 items per page
        const offset = (pageNum - 1) * limitNum;

        queryBuilder.skip(offset).take(limitNum);

        const [bills, total] = await queryBuilder.getManyAndCount();

        const pagination = {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
            hasNext: pageNum < Math.ceil(total / limitNum),
            hasPrev: pageNum > 1,
        };

        logger.info("Bills searched successfully", {
            userId,
            filters: {
                productName,
                category,
                startDate,
                endDate,
                minAmount,
                maxAmount,
                warrantyStatus,
            },
            pagination,
            count: bills.length,
        });

        return ApiResponse.success(res, "Bills searched successfully", {
            bills,
            pagination,
            filters: {
                productName: productName || null,
                category: category || null,
                startDate: startDate || null,
                endDate: endDate || null,
                minAmount: minAmount || null,
                maxAmount: maxAmount || null,
                warrantyStatus: warrantyStatus || null,
                vendorName: vendorName || null,
            },
        });
    } catch (error) {
        logger.error("Error searching bills:", error);
        next(error);
    }
};

export const deleteBill = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return ApiResponse.unauthorized(res, "User not authenticated");
        }

        if (!id || isNaN(parseInt(id))) {
            return ApiResponse.badRequest(res, "Invalid bill ID");
        }

        const billRepository = AppDataSource.getRepository(Bill);
        const bill = await billRepository.findOne({
            where: {
                id: parseInt(id),
                user: { id: userId },
            },
        });

        if (!bill) {
            return ApiResponse.notFound(res, "Bill not found");
        }

        // Delete associated file
        if (bill.path && fs.existsSync(bill.path)) {
            try {
                fs.unlinkSync(bill.path);
                logger.info("Bill file deleted", { path: bill.path });
            } catch (fileError) {
                logger.warn("Failed to delete bill file", {
                    path: bill.path,
                    error: fileError,
                });
            }
        }

        await billRepository.remove(bill);

        logger.info("Bill deleted successfully", { billId: bill.id, userId });
        return ApiResponse.success(res, "Bill deleted successfully");
    } catch (error) {
        logger.error("Error deleting bill:", error);
        next(error);
    }
};

export const getCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const categories = categorizationService.getAllCategories();
        return ApiResponse.success(res, "Categories retrieved successfully", {
            categories,
        });
    } catch (error) {
        logger.error("Error retrieving categories:", error);
        next(error);
    }
};

export const categorizeBill = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { text, vendorName, productName } = req.body;

        if (!text) {
            return ApiResponse.badRequest(
                res,
                "Text is required for categorization"
            );
        }

        const categoryMatch = categorizationService.categorizeByText(
            text,
            vendorName,
            productName
        );

        logger.info("Bill categorized successfully", { categoryMatch });
        return ApiResponse.success(res, "Bill categorized successfully", {
            categoryMatch,
        });
    } catch (error) {
        logger.error("Error categorizing bill:", error);
        next(error);
    }
};
