import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { motion } from "framer-motion";
import {
    CloudArrowUpIcon,
    DocumentTextIcon,
    XMarkIcon,
    PhotoIcon,
    ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { BillData, OCRProcessingState } from "./types/ocr.types";
import ocrService from "../../services/ocr.service";
import { useToast } from "../../components/ui/Toast";

interface OCRImageUploadProps {
    onProcessingComplete: (billData: BillData) => void;
    onTextExtracted?: (text: string) => void;
    className?: string;
    mode?: "process" | "extract-text" | "both";
}

export const OCRImageUpload: React.FC<OCRImageUploadProps> = ({
    onProcessingComplete,
    onTextExtracted,
    className = "",
    mode = "process",
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [processingState, setProcessingState] = useState<OCRProcessingState>({
        isProcessing: false,
        progress: 0,
        stage: "upload",
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addToast } = useToast();

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelection(files[0]);
        }
    };

    const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelection(files[0]);
        }
    };

    const handleFileSelection = (file: File) => {
        // Validate file type
        if (!ocrService.isValidImageFile(file)) {
            addToast(
                "Please select a valid image file (JPEG, PNG, BMP, TIFF, or WebP)",
                "error"
            );
            return;
        }

        // Validate file size
        if (!ocrService.isValidFileSize(file)) {
            addToast("File size must be less than 10MB", "error");
            return;
        }

        setSelectedFile(file);

        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        addToast(
            `File selected: ${file.name} (${ocrService.getFormattedFileSize(
                file
            )})`,
            "success"
        );
    };

    const clearSelectedFile = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const updateProcessingProgress = (
        stage: OCRProcessingState["stage"],
        progress: number
    ) => {
        setProcessingState((prev) => ({
            ...prev,
            stage,
            progress,
            error: undefined,
        }));
    };

    const processImage = async () => {
        if (!selectedFile) return;

        setProcessingState({
            isProcessing: true,
            progress: 0,
            stage: "upload",
        });

        try {
            updateProcessingProgress("upload", 25);

            if (mode === "extract-text" || mode === "both") {
                updateProcessingProgress("ocr", 50);
                const extractedText = await ocrService.extractText(
                    selectedFile
                );

                if (onTextExtracted) {
                    onTextExtracted(extractedText);
                }

                if (mode === "extract-text") {
                    updateProcessingProgress("complete", 100);
                    addToast("Text extracted successfully!", "success");
                    setProcessingState((prev) => ({
                        ...prev,
                        isProcessing: false,
                    }));
                    return;
                }
            }

            if (mode === "process" || mode === "both") {
                updateProcessingProgress("ocr", 60);
                updateProcessingProgress("parsing", 80);

                const billData = await ocrService.processImage(selectedFile);

                updateProcessingProgress("complete", 100);

                onProcessingComplete(billData);
                addToast("Image processed successfully!", "success");
            }

            setProcessingState((prev) => ({ ...prev, isProcessing: false }));
        } catch (error: any) {
            console.error("Error processing image:", error);
            setProcessingState({
                isProcessing: false,
                progress: 0,
                stage: "error",
                error: error.message || "Failed to process image",
            });
            addToast(error.message || "Failed to process image", "error");
        }
    };

    const getStageText = (stage: OCRProcessingState["stage"]) => {
        switch (stage) {
            case "upload":
                return "Uploading image...";
            case "ocr":
                return "Extracting text from image...";
            case "parsing":
                return "Parsing bill data...";
            case "complete":
                return "Processing complete!";
            case "error":
                return "Processing failed";
            default:
                return "Processing...";
        }
    };

    return (
        <motion.div
            className={`space-y-4 ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${
              isDragOver
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }
          ${
              processingState.isProcessing
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
          }
        `}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={processingState.isProcessing}
                />

                {selectedFile && previewUrl ? (
                    <div key="preview" className="space-y-4">
                        <div className="relative inline-block">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="max-w-full max-h-48 rounded-lg shadow-md"
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearSelectedFile();
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                disabled={processingState.isProcessing}
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {ocrService.getFormattedFileSize(selectedFile)}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div key="upload" className="space-y-4">
                        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />

                        <div>
                            <p className="text-lg font-medium text-black">
                                Drop your receipt or bill image here
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                or click to browse files
                            </p>
                        </div>

                        <div className="text-xs text-gray-400 dark:text-gray-500">
                            Supports JPEG, PNG, BMP, TIFF, WebP (max 10MB)
                        </div>
                    </div>
                )}
            </div>

            {/* Processing State */}
            {processingState.isProcessing && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                {getStageText(processingState.stage)}
                            </p>
                            <div className="mt-2 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error State */}
            {processingState.stage === "error" && processingState.error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm text-red-800 dark:text-red-200">
                        {processingState.error}
                    </p>
                </div>
            )}

            {/* Action Buttons */}
            {selectedFile && !processingState.isProcessing && (
                <div className="flex space-x-3">
                    <button
                        onClick={processImage}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        {mode === "extract-text" ? (
                            <>
                                <DocumentTextIcon className="h-4 w-4 mr-2" />
                                Extract Text
                            </>
                        ) : (
                            <>
                                <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                                Process Image
                            </>
                        )}
                    </button>

                    <button
                        onClick={clearSelectedFile}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Clear
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default OCRImageUpload;
