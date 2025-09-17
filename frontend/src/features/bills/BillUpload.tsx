import React, { useState } from "react";
import { motion } from "framer-motion";
import Card from "../../components/ui/Card";
import SectionHeader from "../../components/ui/SectionHeader";
import { useToast } from "../../components/ui/Toast";
import api from "../../services/api";
import {
    CloudArrowUpIcon,
    DocumentTextIcon,
    PhotoIcon,
} from "@heroicons/react/24/outline";

const BillUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const { addToast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("bill", file);

        try {
            await api.post("/api/bills/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            addToast("Bill uploaded successfully!", "success");
            setFile(null);
        } catch (err) {
            console.error(err);
            addToast("Failed to upload bill.", "error");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <motion.div
            className="max-w-4xl mx-auto mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <SectionHeader
                title="Upload Bill"
                subtitle="Upload your receipts and bills to organize them digitally"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <Card className="p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <CloudArrowUpIcon className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            Upload Your Bill
                        </h3>
                        <p className="text-gray-600">
                            Drag and drop or click to select your bill image
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                                isDragOver
                                    ? "border-indigo-500 bg-indigo-50"
                                    : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
                            }`}
                        >
                            <input
                                className="hidden"
                                id="bill-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={isUploading}
                            />

                            <label
                                htmlFor="bill-upload"
                                className="cursor-pointer"
                            >
                                <div className="space-y-4">
                                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <div>
                                        <p className="text-lg font-medium text-gray-900">
                                            {file
                                                ? file.name
                                                : "Drop your bill here"}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            or click to browse files
                                        </p>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Supports JPEG, PNG, GIF (max 5MB)
                                    </div>
                                </div>
                            </label>
                        </div>

                        {file && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                                        <DocumentTextIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-green-800">
                                            {file.name}
                                        </p>
                                        <p className="text-sm text-green-600">
                                            {(file.size / 1024 / 1024).toFixed(
                                                2
                                            )}{" "}
                                            MB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={!file || isUploading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                    Uploading...
                                </div>
                            ) : (
                                "Upload Bill"
                            )}
                        </button>
                    </form>
                </Card>

                {/* Features Section */}
                <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/30">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                        <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-sm">✨</span>
                        </span>
                        What happens next?
                    </h3>

                    <div className="space-y-6">
                        <div className="flex items-start">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                                <span className="text-white text-sm">🔍</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-1">
                                    OCR Processing
                                </h4>
                                <p className="text-sm text-gray-600">
                                    We'll extract text and data from your bill
                                    automatically
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                                <span className="text-white text-sm">📊</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-1">
                                    Smart Categorization
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Your bill will be automatically categorized
                                    and organized
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                                <span className="text-white text-sm">🛡️</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-1">
                                    Warranty Tracking
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Set up warranty reminders and never miss an
                                    expiration
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                                <span className="text-white text-sm">🔒</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-1">
                                    Secure Storage
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Your bills are stored securely and can be
                                    accessed anytime
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </motion.div>
    );
};

export default BillUpload;
