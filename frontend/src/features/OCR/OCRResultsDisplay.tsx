import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    DocumentTextIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    BuildingStorefrontIcon,
    ListBulletIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ClipboardDocumentIcon,
    PencilIcon,
} from "@heroicons/react/24/outline";
import { BillData, BillItem } from "./types/ocr.types";
import { useToast } from "../../components/ui/Toast";

interface OCRResultsDisplayProps {
    billData: BillData | null;
    extractedText?: string;
    onDataEdit?: (fieldName: string, value: string) => void;
    onReset?: () => void;
    editable?: boolean;
    className?: string;
}

export const OCRResultsDisplay: React.FC<OCRResultsDisplayProps> = ({
    billData,
    extractedText,
    onDataEdit,
    onReset,
    editable = false,
    className = "",
}) => {
    const [showRawText, setShowRawText] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const { addToast } = useToast();

    // Handle case where we only have extracted text but no parsed data
    if (!billData && extractedText) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <DocumentTextIcon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        Text Extracted
                    </h3>
                    <p className="text-gray-600">
                        Raw text has been extracted from your image
                    </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">
                            Extracted Text
                        </span>
                        <button
                            onClick={() =>
                                copyToClipboard(extractedText, "Extracted text")
                            }
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copy text"
                        >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="bg-white rounded-md p-3 border border-gray-200 max-h-64 overflow-y-auto">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                            {extractedText}
                        </pre>
                    </div>
                </div>

                {onReset && (
                    <div className="text-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onReset}
                            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                        >
                            Reset
                        </motion.button>
                    </div>
                )}
            </div>
        );
    }

    // Handle case where both billData and extractedText are null
    if (!billData && !extractedText) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-400 text-3xl">📄</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    No Data Yet
                </h4>
                <p className="text-gray-600">
                    Upload an image to see OCR results here
                </p>
            </div>
        );
    }

    const handleEditStart = (fieldName: string, currentValue: string) => {
        setEditingField(fieldName);
        setEditValue(currentValue || "");
    };

    const handleEditSave = () => {
        if (editingField && onDataEdit) {
            onDataEdit(editingField, editValue);
        }
        setEditingField(null);
        setEditValue("");
    };

    const handleEditCancel = () => {
        setEditingField(null);
        setEditValue("");
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                addToast(`${label} copied to clipboard!`, "success");
            })
            .catch(() => {
                addToast("Failed to copy to clipboard", "error");
            });
    };

    const EditableField: React.FC<{
        fieldName: string;
        value: string | undefined;
        label: string;
        icon: React.ReactNode;
        type?: "text" | "date" | "number";
    }> = ({ fieldName, value, label, icon, type = "text" }) => {
        const isEditing = editingField === fieldName;

        return (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                        {icon}
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {label}
                        </span>
                    </div>

                    {editable && !isEditing && value && (
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={() => copyToClipboard(value, label)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                title={`Copy ${label.toLowerCase()}`}
                            >
                                <ClipboardDocumentIcon className="h-4 w-4" />
                            </button>

                            <button
                                onClick={() =>
                                    handleEditStart(fieldName, value)
                                }
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                title={`Edit ${label.toLowerCase()}`}
                            >
                                <PencilIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <div className="space-y-2">
                        <input
                            type={type}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleEditSave();
                                if (e.key === "Escape") handleEditCancel();
                            }}
                        />
                        <div className="flex space-x-2">
                            <button
                                onClick={handleEditSave}
                                className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                            >
                                Save
                            </button>
                            <button
                                onClick={handleEditCancel}
                                className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p
                        className={`text-lg font-semibold ${
                            value
                                ? "text-gray-900 dark:text-gray-100"
                                : "text-gray-400 dark:text-gray-500 italic"
                        }`}
                    >
                        {value || `No ${label.toLowerCase()} found`}
                    </p>
                )}
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className={`space-y-6 ${className}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-black flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    OCR Results
                </h3>

                {billData?.rawText && (
                    <button
                        onClick={() => setShowRawText(!showRawText)}
                        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                        <span>Raw Text</span>
                        {showRawText ? (
                            <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                            <ChevronDownIcon className="h-4 w-4" />
                        )}
                    </button>
                )}
            </div>

            {/* Extracted Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditableField
                    fieldName="vendorName"
                    value={billData?.vendorName}
                    label="Vendor Name"
                    icon={
                        <BuildingStorefrontIcon className="h-4 w-4 text-blue-500" />
                    }
                />

                <EditableField
                    fieldName="totalAmount"
                    value={billData?.totalAmount}
                    label="Total Amount"
                    icon={
                        <CurrencyDollarIcon className="h-4 w-4 text-green-500" />
                    }
                    type="number"
                />

                <div className="md:col-span-2">
                    <EditableField
                        fieldName="date"
                        value={billData?.date}
                        label="Date"
                        icon={
                            <CalendarIcon className="h-4 w-4 text-purple-500" />
                        }
                        type="date"
                    />
                </div>
            </div>

            {/* Items List */}
            {billData?.items && billData.items.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-4">
                        <ListBulletIcon className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Items ({billData?.items.length})
                        </span>
                    </div>

                    <div className="space-y-3">
                        {billData?.items.map(
                            (item: BillItem, index: number) => (
                                <motion.div
                                    key={index}
                                    initial={{ x: -5 }}
                                    animate={{ x: 0 }}
                                    transition={{
                                        delay: index * 0.1,
                                        duration: 0.3,
                                    }}
                                    className="bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-600"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                                        <div className="md:col-span-2">
                                            <span className="text-xs text-gray-500 dark:text-gray-400 block">
                                                Description
                                            </span>
                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                {item.description}
                                            </span>
                                        </div>

                                        {item.quantity && (
                                            <div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 block">
                                                    Quantity
                                                </span>
                                                <span className="text-gray-700 dark:text-gray-200">
                                                    {item.quantity}
                                                </span>
                                            </div>
                                        )}

                                        {item.unitPrice && (
                                            <div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 block">
                                                    Unit Price
                                                </span>
                                                <span className="text-gray-700 dark:text-gray-200">
                                                    ${item.unitPrice}
                                                </span>
                                            </div>
                                        )}

                                        {item.amount && (
                                            <div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 block">
                                                    Amount
                                                </span>
                                                <span className="font-medium text-green-600 dark:text-green-400">
                                                    ${item.amount}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        )}
                    </div>
                </div>
            )}

            {/* Raw Text Display */}
            {showRawText && billData?.rawText && (
                <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Raw Extracted Text
                        </span>
                        <button
                            onClick={() =>
                                copyToClipboard(
                                    billData?.rawText || "",
                                    "Raw text"
                                )
                            }
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            title="Copy raw text"
                        >
                            <ClipboardDocumentIcon className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-600 max-h-64 overflow-y-auto">
                        <pre className="text-xs text-gray-700 dark:text-gray-200 whitespace-pre-wrap font-mono">
                            {billData?.rawText}
                        </pre>
                    </div>
                </motion.div>
            )}

            {/* Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-black mb-2">
                    Processing Summary
                </h4>
                <div className="text-sm text-gray-600">
                    <p>✓ Text extracted from image</p>
                    {billData?.vendorName && <p>✓ Vendor name identified</p>}
                    {billData?.totalAmount && <p>✓ Total amount found</p>}
                    {billData?.date && <p>✓ Date parsed</p>}
                    {billData?.items && billData.items.length > 0 && (
                        <p>✓ {billData.items.length} item(s) detected</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default OCRResultsDisplay;
