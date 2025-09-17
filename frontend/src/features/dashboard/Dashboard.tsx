import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import SectionHeader from "../../components/ui/SectionHeader";
import { Link } from "react-router-dom";

interface Bill {
    id: number;
    productName: string;
    purchaseDate: string;
    warrantyPeriod: number;
    category?: string;
    filename?: string;
    text?: string;
    path?: string;
    createdAt?: string;
    updatedAt?: string;
    formattedDate?: string;
    notes?: string;
}

const Dashboard: React.FC = () => {
    const [bills, setBills] = useState<Bill[]>([]);
    const [expiringSoon, setExpiringSoon] = useState<Bill[]>([]);
    const [activeWarranties, setActiveWarranties] = useState(0);

    useEffect(() => {
        const fetchBills = async () => {
            try {
                const res = await api.get("/api/bills");
                console.log("Bills response:", res);

                // Handle the response based on our api interceptor
                // The api interceptor extracts the data, so res.data should be the bills array
                if (Array.isArray(res.data)) {
                    setBills(res.data);
                } else if (res.data?.bills) {
                    setBills(res.data.bills);
                } else {
                    console.warn("Unexpected bills response format:", res.data);
                    setBills([]);
                }
            } catch (err) {
                console.error("Error fetching bills:", err);
                setBills([]);
            }
        };

        fetchBills();
    }, []);

    useEffect(() => {
        const calculateWarrantyInfo = () => {
            let activeCount = 0;
            const soon: Bill[] = [];
            const today = new Date();
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(today.getDate() + 30);

            bills.forEach((bill) => {
                if (bill.purchaseDate && bill.warrantyPeriod) {
                    const purchaseDate = new Date(bill.purchaseDate);
                    const expiryDate = new Date(
                        purchaseDate.setMonth(
                            purchaseDate.getMonth() + bill.warrantyPeriod
                        )
                    );

                    if (expiryDate > today) {
                        activeCount++;
                        if (expiryDate <= thirtyDaysFromNow) {
                            soon.push(bill);
                        }
                    }
                }
            });
            setActiveWarranties(activeCount);
            setExpiringSoon(soon);
        };

        calculateWarrantyInfo();
    }, [bills]);

    return (
        <motion.div
            className="max-w-7xl mx-auto mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <SectionHeader
                title="Dashboard"
                subtitle="Welcome back! Here's an overview of your bills and warranties."
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div>
                    <Card className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/30 hover:border-blue-300/50 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-blue-700 mb-1">
                                    Total Bills
                                </h3>
                                <p className="text-3xl font-bold text-blue-900">
                                    {bills.length}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    All time bills
                                </p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-white text-xl">📄</span>
                            </div>
                        </div>
                    </Card>
                </div>

                <div>
                    <Card className="p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border border-green-200/30 hover:border-green-300/50 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-green-700 mb-1">
                                    Active Warranties
                                </h3>
                                <p className="text-3xl font-bold text-green-900">
                                    {activeWarranties}
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                    Currently active
                                </p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-white text-xl">🛡️</span>
                            </div>
                        </div>
                    </Card>
                </div>

                <div>
                    <Card className="p-6 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-orange-700 mb-1">
                                    Expiring Soon
                                </h3>
                                <p className="text-3xl font-bold text-orange-900">
                                    {expiringSoon.length}
                                </p>
                                <p className="text-xs text-orange-600 mt-1">
                                    Next 30 days
                                </p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-white text-xl">⚠️</span>
                            </div>
                        </div>
                    </Card>
                </div>

                <div>
                    <Card className="p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border border-purple-200/30 hover:border-purple-300/50 transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-purple-700 mb-1">
                                    Categories
                                </h3>
                                <p className="text-3xl font-bold text-purple-900">
                                    {
                                        new Set(
                                            bills.map((bill) => bill.category)
                                        ).size
                                    }
                                </p>
                                <p className="text-xs text-purple-600 mt-1">
                                    Unique categories
                                </p>
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-white text-xl">🏷️</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/30">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-sm">⚡</span>
                        </span>
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 text-left group">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                                    <span className="text-white text-sm">
                                        📤
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        Upload Bill
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Add new receipt
                                    </p>
                                </div>
                            </div>
                        </button>

                        <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 text-left group">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                                    <span className="text-white text-sm">
                                        🔍
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        Search Bills
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Find specific bills
                                    </p>
                                </div>
                            </div>
                        </button>

                        <button className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 text-left group">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                                    <span className="text-white text-sm">
                                        🤝
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        Share Bills
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Collaborate with others
                                    </p>
                                </div>
                            </div>
                        </button>
                    </div>
                </Card>
            </div>

            {/* Expiring Warranties */}
            <div>
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center">
                            <span className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-white text-sm">⏰</span>
                            </span>
                            Warranties Expiring Soon
                        </h3>
                        {expiringSoon.length > 0 && (
                            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                                {expiringSoon.length} expiring
                            </span>
                        )}
                    </div>

                    {expiringSoon.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-green-600 text-3xl">
                                    ✅
                                </span>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                All Good!
                            </h4>
                            <p className="text-gray-600">
                                No warranties expiring in the next 30 days.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {expiringSoon.map((bill, index) => (
                                <div
                                    key={bill.id}
                                    className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200/50 hover:from-orange-100 hover:to-red-100 hover:shadow-md transition-all duration-200"
                                >
                                    <Link
                                        to={`/bills/${bill.id}`}
                                        className="flex items-center justify-between group"
                                    >
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                                                <span className="text-white text-lg">
                                                    📄
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-lg font-semibold text-orange-800 group-hover:text-orange-900">
                                                    {bill.productName}
                                                </span>
                                                <p className="text-sm text-orange-600">
                                                    Category:{" "}
                                                    {bill.category || "Other"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-orange-600 text-sm font-medium">
                                                ⚠️ Expiring
                                            </span>
                                            <span className="text-orange-500">
                                                →
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </motion.div>
    );
};

export default Dashboard;
