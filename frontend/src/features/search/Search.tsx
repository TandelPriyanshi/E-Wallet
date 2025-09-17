import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    DocumentTextIcon,
    CalendarIcon,
    TagIcon,
} from "@heroicons/react/24/outline";
import api from "../../services/api";
import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import SectionHeader from "../../components/ui/SectionHeader";

interface Bill {
    id: number;
    productName: string;
    category: string;
    purchaseDate: string;
    amount?: number;
    filename?: string;
    path?: string;
    createdAt?: string;
}

const Search: React.FC = () => {
    const [productName, setProductName] = useState("");
    const [category, setCategory] = useState("");
    const [purchaseDate, setPurchaseDate] = useState("");
    const [results, setResults] = useState<Bill[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setHasSearched(true);
        setIsSearching(true);

        try {
            const token = localStorage.getItem("token");

            const res = await api.get("/api/bills/search", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    productName: productName || undefined,
                    category: category || undefined,
                    purchaseDate: purchaseDate || undefined,
                },
            });

            // After API interceptor, the structure is: res.data = { bills: [...] }
            const searchResults = res.data?.bills || [];
            setResults(searchResults);
        } catch (err) {
            console.error("Search error:", err);
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const clearSearch = () => {
        setProductName("");
        setCategory("");
        setPurchaseDate("");
        setResults([]);
        setHasSearched(false);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "No date";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <motion.div
            className="max-w-6xl mx-auto mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <SectionHeader
                title="Search Bills"
                subtitle="Find your bills quickly with advanced search filters"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Search Filters */}
                <div className="lg:col-span-1">
                    <Card className="p-6">
                        <div className="flex items-center mb-6">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                                <FunnelIcon className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">
                                Search Filters
                            </h3>
                        </div>

                        <form onSubmit={handleSearch} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    value={productName}
                                    onChange={(e) =>
                                        setProductName(e.target.value)
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Search by product name..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) =>
                                        setCategory(e.target.value)
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                >
                                    <option value="">All Categories</option>
                                    <option value="Electronics">
                                        Electronics
                                    </option>
                                    <option value="Clothing">Clothing</option>
                                    <option value="Food">Food</option>
                                    <option value="Home">Home</option>
                                    <option value="Automotive">
                                        Automotive
                                    </option>
                                    <option value="Health">Health</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Purchase Date
                                </label>
                                <input
                                    type="date"
                                    value={purchaseDate}
                                    onChange={(e) =>
                                        setPurchaseDate(e.target.value)
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>

                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={isSearching}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSearching ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                            Searching...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                                            Search Bills
                                        </div>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Search Results */}
                <div className="lg:col-span-2">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-4">
                                    <DocumentTextIcon className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">
                                    Search Results
                                </h3>
                            </div>
                            {hasSearched && (
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                                    {results.length}{" "}
                                    {results.length === 1
                                        ? "result"
                                        : "results"}
                                </span>
                            )}
                        </div>

                        {!hasSearched ? (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MagnifyingGlassIcon className="h-10 w-10 text-gray-400" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                    Start Your Search
                                </h4>
                                <p className="text-gray-600">
                                    Use the filters on the left to find your
                                    bills
                                </p>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-orange-600 text-3xl">
                                        🔍
                                    </span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                    No Results Found
                                </h4>
                                <p className="text-gray-600 mb-4">
                                    Try adjusting your search criteria
                                </p>
                                <button
                                    onClick={clearSearch}
                                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-4">
                                    {results.map((bill, index) => (
                                        <div
                                            key={bill.id}
                                            className="p-6 bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-xl hover:shadow-lg hover:border-indigo-300 transition-all duration-200"
                                        >
                                            <Link
                                                to={`/bills/${bill.id}`}
                                                className="block group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                                            <DocumentTextIcon className="h-6 w-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                                                                {bill.productName ||
                                                                    bill.filename ||
                                                                    "Untitled Bill"}
                                                            </h4>
                                                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                                                {bill.category && (
                                                                    <span className="flex items-center">
                                                                        <TagIcon className="h-4 w-4 mr-1" />
                                                                        <span className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-medium">
                                                                            {
                                                                                bill.category
                                                                            }
                                                                        </span>
                                                                    </span>
                                                                )}
                                                                <span className="flex items-center">
                                                                    <CalendarIcon className="h-4 w-4 mr-1" />
                                                                    {formatDate(
                                                                        bill.purchaseDate ||
                                                                            bill.createdAt
                                                                    )}
                                                                </span>
                                                                {bill.amount && (
                                                                    <span className="font-semibold text-green-600">
                                                                        $
                                                                        {bill.amount.toFixed(
                                                                            2
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-indigo-500 group-hover:text-indigo-700 transition-colors">
                                                        <span className="text-sm font-medium">
                                                            View →
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </motion.div>
    );
};

export default Search;
