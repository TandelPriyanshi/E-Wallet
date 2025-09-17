import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    DocumentTextIcon,
    SparklesIcon,
    EyeIcon,
    CogIcon,
} from "@heroicons/react/24/outline";
import OCRImageUpload from "./OCRImageUpload";
import OCRResultsDisplay from "./OCRResultsDisplay";
import { BillData } from "./types/ocr.types";
import Card from "../../components/ui/Card";
import SectionHeader from "../../components/ui/SectionHeader";

const OCRPage: React.FC = () => {
    const [billData, setBillData] = useState<BillData | null>(null);
    const [extractedText, setExtractedText] = useState<string>("");

    const handleProcessingComplete = (data: BillData) => {
        setBillData(data);
    };

    const handleTextExtracted = (text: string) => {
        setExtractedText(text);
    };

    const handleDataEdit = (fieldName: string, value: string) => {
        if (!billData) return;

        setBillData((prev) => ({
            ...prev!,
            [fieldName]: value,
        }));
    };

    const handleReset = () => {
        setBillData(null);
        setExtractedText("");
    };

    return (
        <motion.div
            className="max-w-7xl mx-auto mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <SectionHeader
                title="OCR Processing"
                subtitle="Extract text and data from your bills using advanced OCR technology"
            />

            {/* Features Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/30">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <EyeIcon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Smart Recognition
                        </h3>
                        <p className="text-sm text-gray-600">
                            Advanced OCR technology extracts text with high
                            accuracy
                        </p>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/30">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <SparklesIcon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Auto-Parsing
                        </h3>
                        <p className="text-sm text-gray-600">
                            Intelligently identifies dates, amounts, and product
                            names
                        </p>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/30">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <CogIcon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Easy Editing
                        </h3>
                        <p className="text-sm text-gray-600">
                            Review and edit extracted data before saving
                        </p>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div>
                    <Card className="p-8">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <DocumentTextIcon className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Upload Image
                            </h3>
                            <p className="text-gray-600">
                                Upload your bill or receipt image for OCR
                                processing
                            </p>
                        </div>

                        <OCRImageUpload
                            onProcessingComplete={handleProcessingComplete}
                            onTextExtracted={handleTextExtracted}
                            mode="both"
                        />
                    </Card>
                </div>

                {/* Results Section */}
                <div>
                    <Card className="p-8">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <SparklesIcon className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Processing Results
                            </h3>
                            <p className="text-gray-600">
                                Review and edit the extracted data
                            </p>
                        </div>

                        {billData || extractedText ? (
                            <OCRResultsDisplay
                                billData={billData}
                                extractedText={extractedText}
                                onDataEdit={handleDataEdit}
                                onReset={handleReset}
                            />
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-gray-400 text-3xl">
                                        📄
                                    </span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                    No Data Yet
                                </h4>
                                <p className="text-gray-600">
                                    Upload an image to see OCR results here
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* How It Works */}
            <div className="mt-8">
                <Card className="p-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/30">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center flex items-center justify-center">
                        <span className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-sm">⚡</span>
                        </span>
                        How OCR Processing Works
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <span className="text-white text-lg">1️⃣</span>
                            </div>
                            <h4 className="font-semibold text-gray-800 mb-1">
                                Upload
                            </h4>
                            <p className="text-sm text-gray-600">
                                Upload your bill image
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <span className="text-white text-lg">2️⃣</span>
                            </div>
                            <h4 className="font-semibold text-gray-800 mb-1">
                                Process
                            </h4>
                            <p className="text-sm text-gray-600">
                                OCR extracts text data
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <span className="text-white text-lg">3️⃣</span>
                            </div>
                            <h4 className="font-semibold text-gray-800 mb-1">
                                Parse
                            </h4>
                            <p className="text-sm text-gray-600">
                                AI identifies key information
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <span className="text-white text-lg">4️⃣</span>
                            </div>
                            <h4 className="font-semibold text-gray-800 mb-1">
                                Review
                            </h4>
                            <p className="text-sm text-gray-600">
                                Edit and save your data
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </motion.div>
    );
};

export default OCRPage;
