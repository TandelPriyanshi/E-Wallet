import { motion } from "framer-motion";
import React from "react";

interface ModalProps {
    children: React.ReactNode;
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <motion.div
                className="relative w-full max-w-md"
                initial={{ y: -5 }}
                animate={{ y: 0 }}
                exit={{ y: 5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
            >
                <div className="relative bg-white rounded-xl shadow-2xl p-6 border border-gray-100">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

export default Modal;
