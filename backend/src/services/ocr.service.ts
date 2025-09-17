import { createWorker, PSM } from "tesseract.js";
import logger from "../utils/logger";

export interface BillData {
    totalAmount?: string;
    date?: string;
    vendorName?: string;
    items?: Array<{
        description: string;
        quantity?: string;
        unitPrice?: string;
        amount?: string;
    }>;
    rawText: string;
}

export class OCRService {
    private static instance: OCRService;

    private constructor() {}

    public static getInstance(): OCRService {
        if (!OCRService.instance) {
            OCRService.instance = new OCRService();
        }
        return OCRService.instance;
    }

    public async extractTextFromImage(imagePath: string): Promise<string> {
        const worker = await createWorker("eng", 1, {
            logger: (m) => console.log(m.status || m),
        });

        try {
            // Set Tesseract parameters for better recognition
            await worker.setParameters({
                tessedit_char_whitelist:
                    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$€£.,- ",
                preserve_interword_spaces: "1",
                tessedit_pageseg_mode: PSM.SINGLE_BLOCK as any,
            });

            // Perform OCR
            const {
                data: { text },
            } = await worker.recognize(imagePath);
            return text;
        } catch (error) {
            logger.error("Error during text extraction:", error);
            throw new Error("Failed to extract text from image");
        } finally {
            await worker.terminate();
        }
    }

    public async processImage(imagePath: string): Promise<BillData> {
        // Create a worker with English language
        const worker = await createWorker("eng", 1, {
            logger: (m) => console.log(m.status || m),
        });

        try {
            // Set Tesseract parameters for better recognition
            await worker.setParameters({
                tessedit_char_whitelist:
                    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$€£.,- ",
                preserve_interword_spaces: "1",
                tessedit_pageseg_mode: PSM.SINGLE_BLOCK as any,
            });

            // Perform OCR
            const {
                data: { text },
            } = await worker.recognize(imagePath);

            // Parse the extracted text
            return this.parseBillText(text);
        } catch (error) {
            logger.error("Error during OCR processing:", error);
            throw new Error("Failed to process image with OCR");
        } finally {
            await worker.terminate();
        }
    }

    private parseBillText(text: string): BillData {
        const lines = text.split("\n").filter((line) => line.trim().length > 0);
        const result: BillData = {
            rawText: text,
            items: [],
        };

        // Enhanced parsing logic with better patterns
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const upperLine = line.toUpperCase();

            // Enhanced total amount detection
            if (!result.totalAmount) {
                const totalPatterns = [
                    /(?:total|balance|amount|grand\s*total|net\s*total|subtotal)\s*:?\s*\$?([0-9]+[.,]?[0-9]*)\s*(?:USD|INR|EUR|\$)?/gi,
                    /\$\s*([0-9]+[.,]?[0-9]*)\s*(?:total|balance)/gi,
                    /([0-9]+[.,]?[0-9]*)\s*(?:total|balance)/gi,
                ];

                for (const pattern of totalPatterns) {
                    const match = line.match(pattern);
                    if (match && match[1]) {
                        result.totalAmount = match[1].replace(",", ".");
                        break;
                    }
                }
            }

            // Enhanced date detection
            if (!result.date) {
                const datePatterns = [
                    /(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})/,
                    /(\d{4}[\/.-]\d{1,2}[\/.-]\d{1,2})/,
                    /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{2,4})/i,
                    /(?:date|dated?)\s*:?\s*(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})/i,
                ];

                for (const pattern of datePatterns) {
                    const match = line.match(pattern);
                    if (match && match[1]) {
                        result.date = match[1];
                        break;
                    }
                }
            }

            // Enhanced vendor name detection
            if (!result.vendorName && i < 5) {
                // Look in first 5 lines
                // Skip lines that are clearly not vendor names
                if (
                    line.length > 3 &&
                    line.length < 80 &&
                    !upperLine.includes("RECEIPT") &&
                    !upperLine.includes("INVOICE") &&
                    !upperLine.includes("BILL") &&
                    !upperLine.includes("DATE") &&
                    !upperLine.includes("TIME") &&
                    !/^\d+/.test(line) &&
                    !/^\$/.test(line)
                ) {
                    // Clean up the vendor name
                    result.vendorName = line
                        .replace(/[^a-zA-Z0-9\s&.-]/g, " ")
                        .replace(/\s+/g, " ")
                        .trim();

                    if (result.vendorName.length < 3) {
                        result.vendorName = undefined;
                    }
                }
            }

            // Enhanced item detection with multiple patterns
            const itemPatterns = [
                // Pattern: Item Name Qty Price Total
                /^(.{3,30})\s+(\d+)\s+([0-9.,]+)\s+([0-9.,]+)$/,
                // Pattern: Item Name followed by price
                /^(.{3,40})\s+\$?([0-9.,]+)$/,
                // Pattern: Quantity x Item Name = Price
                /^(\d+)\s*x\s*(.{3,30})\s*=?\s*\$?([0-9.,]+)$/i,
            ];

            for (const pattern of itemPatterns) {
                const match = line.match(pattern);
                if (match && match[1]) {
                    result.items = result.items || [];

                    if (pattern === itemPatterns[0]) {
                        // Full item with qty and prices
                        result.items.push({
                            description: match[1].trim(),
                            quantity: match[2],
                            unitPrice: match[3]
                                ? match[3].replace(",", ".")
                                : undefined,
                            amount: match[4]
                                ? match[4].replace(",", ".")
                                : undefined,
                        });
                    } else if (pattern === itemPatterns[1]) {
                        // Simple item with price
                        result.items.push({
                            description: match[1].trim(),
                            amount: match[2]
                                ? match[2].replace(",", ".")
                                : undefined,
                        });
                    } else if (pattern === itemPatterns[2]) {
                        // Quantity x item format
                        result.items.push({
                            description: match[2].trim(),
                            quantity: match[1],
                            amount: match[3]
                                ? match[3].replace(",", ".")
                                : undefined,
                        });
                    }
                    break;
                }
            }
        }

        // Post-process to clean up results
        if (result.vendorName) {
            result.vendorName = result.vendorName.trim();
            if (result.vendorName.length < 3) {
                result.vendorName = undefined;
            }
        }

        return result;
    }
}

export const ocrService = OCRService.getInstance();
