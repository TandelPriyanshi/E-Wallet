import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { motion } from "framer-motion";
import Card from "../../components/ui/Card";
import SectionHeader from "../../components/ui/SectionHeader";
import Empty from "../../components/ui/Empty";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../components/ui/Toast";
import ShareBillModal from "../../components/bills/ShareBillModal";

// Simple date formatter function
const formatDate = (dateString?: string) => {
    if (!dateString) return "No date";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

interface Bill {
    id: number;
    filename: string;
    text: string;
    path?: string;
    createdAt?: string;
    updatedAt?: string;
    formattedDate?: string;
    productName?: string;
    purchaseDate?: string;
    warrantyPeriod?: number;
    notes?: string;
    category?: string;
}

const BillList: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

    const handleBillClick = (bill: Bill) => {
        // If bill has productName, it's saved, navigate to BillCard
        // Otherwise, navigate to BillDetails to fill in the information
        if (bill.productName) {
            navigate(`/bills/${bill.id}`);
        } else {
            navigate(`/bills/${bill.id}/edit`);
        }
    };

    const fetchBills = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get("/api/bills");

            console.log(res.data);

            // Handle the API response structure
            const responseData = res.data;
            let billsData = [];

            // After API interceptor, the structure is: response.data = { bills: [...] }
            if (responseData && Array.isArray(responseData.bills)) {
                billsData = responseData.bills;
            } else if (Array.isArray(responseData)) {
                billsData = responseData;
            } else if (
                responseData &&
                responseData.data &&
                Array.isArray(responseData.data.bills)
            ) {
                billsData = responseData.data.bills;
            }

            // Format dates
            const formattedBills = billsData.map((bill: any) => ({
                ...bill,
                formattedDate: formatDate(bill.createdAt),
            }));

            setBills(formattedBills);
        } catch (err) {
            console.error("Error fetching bills:", err);
            setError("Failed to load bills. Please try again.");
            setBills([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBills();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 },
        },
        exit: {
            opacity: 0,
            x: -100,
            transition: { duration: 0.2 },
        },
    };

    const handleDelete = async (billId: number) => {
        const billToDelete = bills.find((bill) => bill.id === billId);

        // @ts-ignore - We know the Toast component can handle these options
        addToast(
            `Are you sure you want to delete ${
                billToDelete?.productName || "this bill"
            }?`,
            "confirm",
            {
                actions: [
                    {
                        label: "Cancel",
                        onClick: () => {
                            // Do nothing, just close the toast
                        },
                        variant: "secondary",
                    },
                    {
                        label: "Delete",
                        onClick: async () => {
                            try {
                                setDeletingId(billId);
                                await api.delete(`/api/bills/${billId}`);

                                setBills(
                                    bills.filter((bill) => bill.id !== billId)
                                );
                                // @ts-ignore
                                addToast(
                                    "Bill deleted successfully",
                                    "success"
                                );
                            } catch (error) {
                                console.error("Error deleting bill:", error);
                                // @ts-ignore
                                addToast("Failed to delete bill", "error");
                            } finally {
                                setDeletingId(null);
                            }
                        },
                        variant: "danger",
                    },
                ],
                autoDismiss: true,
                timeout: 10000, // 10 seconds for the confirmation dialog
            }
        );
    };

    return (
        <motion.div
            className="max-w-4xl mx-auto mt-8"
            initial={{ y: 5 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
        >
            <SectionHeader title="My Bills" />
            <Card className="p-6">
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-red-600">
                        <p>{error}</p>
                        <button
                            onClick={() => {
                                setError(null);
                                fetchBills();
                            }}
                            className="mt-2 text-indigo-600 hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                ) : bills.length === 0 ? (
                    <Empty
                        title="No bills yet"
                        description="Upload a bill to get started."
                    />
                ) : (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {bills.map((bill, index) => (
                            <motion.div
                                key={bill.id}
                                className="relative"
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                layout
                            >
                                <div
                                    className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                                    onClick={() => handleBillClick(bill)}
                                >
                                    {/* Bill Image */}
                                    <div className="h-40 bg-gray-100 overflow-hidden">
                                        {bill.path &&
                                        bill.path.match(
                                            /\.(jpg|jpeg|png|gif)$/i
                                        ) ? (
                                            <img
                                                src={`http://localhost:3001/${bill.path}`}
                                                alt={bill.filename}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                                                <span className="text-4xl">
                                                    📄
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bill Info */}
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-medium text-gray-900 truncate">
                                                {bill.filename.split(".")[0]}
                                            </h3>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {bill.filename
                                                    .split(".")
                                                    .pop()
                                                    ?.toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center mt-4">
                                            <span className="text-xs text-gray-500">
                                                {bill.formattedDate ||
                                                    "No date"}
                                            </span>

                                            <div className="flex space-x-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleBillClick(bill);
                                                    }}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                                >
                                                    {bill.productName
                                                        ? "View"
                                                        : "Edit"}
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedBill(bill);
                                                        setShareModalOpen(true);
                                                    }}
                                                    className="text-xs text-green-600 hover:text-green-800 font-medium"
                                                >
                                                    Share
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(bill.id);
                                                    }}
                                                    disabled={
                                                        deletingId === bill.id
                                                    }
                                                    className="text-xs text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {deletingId === bill.id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </Card>

            {/* Share Modal */}
            {selectedBill && (
                <ShareBillModal
                    isOpen={shareModalOpen}
                    onClose={() => {
                        setShareModalOpen(false);
                        setSelectedBill(null);
                    }}
                    billId={selectedBill.id}
                    billName={selectedBill.productName || selectedBill.filename}
                />
            )}
        </motion.div>
    );
};

export default BillList;
