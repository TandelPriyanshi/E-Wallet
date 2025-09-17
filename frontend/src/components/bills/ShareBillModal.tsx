import React, { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "../ui/Toast";
import api from "../../services/api";

interface ShareBillModalProps {
    isOpen: boolean;
    onClose: () => void;
    billId: number;
    billName: string;
}

const ShareBillModal: React.FC<ShareBillModalProps> = ({
    isOpen,
    onClose,
    billId,
    billName,
}) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            addToast("Please enter an email address", "error");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            await api.post(
                `/api/shared-bills/bills/${billId}/share`,
                { sharedWithEmail: email },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            addToast(
                `Bill "${billName}" shared successfully with ${email}!`,
                "success"
            );
            setEmail("");
            onClose();
        } catch (error: any) {
            console.error("Error sharing bill:", error);
            const errorMessage =
                error.response?.data?.message || "Failed to share bill";
            addToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail("");
        onClose();
    };

    return (
        <>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.95 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
                        onClick={handleClose}
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.98 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.98 }}
                            transition={{
                                type: "spring",
                                damping: 30,
                                stiffness: 400,
                            }}
                            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-white">
                                        Share Bill
                                    </h3>
                                    <button
                                        onClick={handleClose}
                                        className="text-white hover:text-gray-200 transition-colors duration-150"
                                    >
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="mb-4">
                                    <p className="text-gray-600 text-sm mb-2">
                                        You're about to share:
                                    </p>
                                    <p className="font-medium text-gray-900 truncate">
                                        {billName}
                                    </p>
                                </div>

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Share with (Email address)
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            placeholder="user@example.com"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            disabled={loading}
                                            required
                                        />
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <svg
                                                    className="h-5 w-5 text-blue-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-blue-700">
                                                    The user will be able to
                                                    view this bill but not edit
                                                    it. They must have an
                                                    account with this email
                                                    address.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            disabled={loading}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading || !email.trim()}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-lg hover:shadow-xl"
                                        >
                                            {loading ? (
                                                <div className="flex items-center justify-center">
                                                    <svg
                                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                    Sharing...
                                                </div>
                                            ) : (
                                                "Share Bill"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </>
    );
};

export default ShareBillModal;
