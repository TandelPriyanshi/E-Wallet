import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import SectionHeader from "../../components/ui/SectionHeader";
import {
    UserIcon,
    EnvelopeIcon,
    CalendarIcon,
    CogIcon,
} from "@heroicons/react/24/outline";

interface User {
    id: number;
    email: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    createdAt: string;
    updatedAt: string;
}

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const res = await api.get("/api/users/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.data && res.data.id) {
                    setUser(res.data);
                } else {
                    console.log("No user data found in response");
                    navigate("/login");
                }
            } catch (err: any) {
                console.error("Error fetching user:", err);
                if (err.response?.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto mt-8">
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
                        <div
                            className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-indigo-400 animate-spin"
                            style={{
                                animationDirection: "reverse",
                                animationDuration: "1.5s",
                            }}
                        ></div>
                    </div>
                    <p className="mt-4 text-gray-600">
                        Loading your profile...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto mt-8">
                <Card className="p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-600 text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Profile Not Found
                    </h3>
                    <p className="text-gray-600">
                        Unable to load your profile information.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <motion.div
            className="max-w-4xl mx-auto mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <SectionHeader
                title="Profile"
                subtitle="Manage your account information and preferences"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <Card className="p-8 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <UserIcon className="h-12 w-12 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {user.firstName && user.lastName
                                ? `${user.firstName} ${user.lastName}`
                                : user.username}
                        </h2>
                        <p className="text-gray-600 mb-6">@{user.username}</p>

                        <div className="space-y-3">
                            <div className="flex items-center justify-center text-sm text-gray-500">
                                <EnvelopeIcon className="h-4 w-4 mr-2" />
                                {user.email}
                            </div>
                            <div className="flex items-center justify-center text-sm text-gray-500">
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                Member since {formatDate(user.createdAt)}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Account Details */}
                <div className="lg:col-span-2">
                    <Card className="p-8">
                        <div className="flex items-center mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
                                <CogIcon className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">
                                Account Details
                            </h3>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name
                                    </label>
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                        <span className="text-gray-900">
                                            {user.firstName || "Not provided"}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name
                                    </label>
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                        <span className="text-gray-900">
                                            {user.lastName || "Not provided"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                    <span className="text-gray-900">
                                        {user.email}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Username
                                </label>
                                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                    <span className="text-gray-900">
                                        @{user.username}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Created
                                    </label>
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                        <span className="text-gray-900">
                                            {formatDate(user.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Updated
                                    </label>
                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                        <span className="text-gray-900">
                                            {formatDate(user.updatedAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Stats */}
                    <div className="mt-8">
                        <Card className="p-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/30">
                            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                                <span className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                                    <span className="text-white text-sm">
                                        📊
                                    </span>
                                </span>
                                Account Statistics
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <span className="text-white text-lg">
                                            📄
                                        </span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-800">
                                        0
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Total Bills
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <span className="text-white text-lg">
                                            🏷️
                                        </span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-800">
                                        0
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Categories
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <span className="text-white text-lg">
                                            🛡️
                                        </span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-800">
                                        0
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Active Warranties
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Profile;
