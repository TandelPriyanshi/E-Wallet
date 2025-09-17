import React, { createContext, useContext, useState } from "react";
import { motion } from "framer-motion";

export interface ToastAction {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "danger";
}

interface Toast {
    id: string;
    message: string;
    type: "success" | "error" | "info" | "confirm";
    actions?: ToastAction[];
    onDismiss?: () => void;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (
        message: string,
        type?: "success" | "error" | "info" | "confirm",
        options?: {
            actions?: ToastAction[];
            autoDismiss?: boolean;
            onDismiss?: () => void;
            timeout?: number;
        }
    ) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (
        message: string,
        type: "success" | "error" | "info" | "confirm" = "info",
        options: {
            actions?: ToastAction[];
            autoDismiss?: boolean;
            onDismiss?: () => void;
            timeout?: number;
        } = {}
    ) => {
        const {
            actions = [],
            autoDismiss = type !== "confirm",
            onDismiss,
            timeout = type === "confirm" ? 15000 : 5000,
        } = options;
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [
            ...prev,
            { id, message, type, actions, onDismiss },
        ]);

        // Auto-remove after specified timeout if autoDismiss is true
        if (autoDismiss) {
            setTimeout(() => {
                removeToast(id);
            }, timeout);
        }
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer: React.FC<{
    toasts: Toast[];
    removeToast: (id: string) => void;
}> = ({ toasts, removeToast }) => {
    if (toasts.length === 0) return null;

    const getToastStyles = (type: string) => {
        switch (type) {
            case "success":
                return "bg-green-50 border-green-400";
            case "error":
                return "bg-red-50 border-red-400";
            case "confirm":
                return "bg-amber-50 border-amber-400";
            case "info":
            default:
                return "bg-blue-50 border-blue-400";
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "success":
                return (
                    <div className="flex-shrink-0">
                        <svg
                            className="h-6 w-6 text-green-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                );
            case "error":
                return (
                    <div className="flex-shrink-0">
                        <svg
                            className="h-6 w-6 text-red-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </div>
                );
            case "confirm":
                return (
                    <div className="flex-shrink-0">
                        <svg
                            className="h-6 w-6 text-amber-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                );
            case "info":
            default:
                return (
                    <div className="flex-shrink-0">
                        <svg
                            className="h-6 w-6 text-blue-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                );
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 space-y-3">
            {toasts.map((toast) => (
                <motion.div
                    key={toast.id}
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 300 }}
                    transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 300,
                    }}
                    className={`w-80 rounded-lg shadow-lg overflow-hidden border-l-4 ${getToastStyles(
                        toast.type
                    )}`}
                >
                    <div
                        className="p-4 cursor-pointer"
                        onClick={() => removeToast(toast.id)}
                    >
                        <div className="flex items-start">
                            {getIcon(toast.type)}
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    {toast.message}
                                </p>
                                {toast.actions && toast.actions.length > 0 && (
                                    <div className="mt-2 flex space-x-2">
                                        {toast.actions.map((action, index) => (
                                            <button
                                                key={index}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    action.onClick();
                                                    removeToast(toast.id);
                                                }}
                                                className={`px-3 py-1 text-sm rounded-md ${
                                                    action.variant === "danger"
                                                        ? "bg-red-100 text-red-800 hover:bg-red-200"
                                                        : action.variant ===
                                                          "primary"
                                                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                                }`}
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="h-1 bg-gray-200">
                        <motion.div
                            className="h-full bg-gray-400"
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 7, ease: "linear" }}
                            onAnimationComplete={() => removeToast(toast.id)}
                        />
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
