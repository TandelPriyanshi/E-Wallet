import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import SectionHeader from "../../components/ui/SectionHeader";
import Loader from "../../components/ui/Loader";
import { useToast } from "../../components/ui/Toast";
import ShareBillModal from "../../components/bills/ShareBillModal";

interface Bill {
    id: number;
    filename: string;
    rawText?: string; // Make optional as it might not always be present
    path?: string; // Make optional as it might not always be present
    metadata?: {
        totalAmount?: string;
        date?: string;
        vendorName?: string;
        items?: Array<{
            description: string;
            quantity?: string;
            unitPrice?: string;
            amount?: string;
        }>;
    } | null; // Allow metadata to be null
    productName?: string | null;
    purchaseDate?: string | null;
    warrantyPeriod?: number | null;
    notes?: string | null;
    category?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

const BillCard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [bill, setBill] = useState<Bill | null>(null);
    const [loading, setLoading] = useState(true);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [sharedBillInfo, setSharedBillInfo] = useState<any>(null);
    const [isOwner, setIsOwner] = useState(true);
    const navigate = useNavigate();
    const { addToast } = useToast();

    useEffect(() => {
        const fetchBill = async () => {
            try {
                console.log("Fetching bill with ID:", id);
                const token = localStorage.getItem("token");
                const res = await api.get(`/api/bills/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log("API Response:", res.data);

                // Extract bill data from the response
                let billData =
                    res.data?.data?.bill || res.data?.bill || res.data;

                if (!billData) {
                    throw new Error("No bill data received from server");
                }

                console.log("Extracted bill data:", billData);
                setBill(billData);
                
                // Get current user data
                const userData = localStorage.getItem('user');
                console.log('Raw user data from localStorage (BillCard):', userData);
                
                if (userData) {
                    try {
                        const user = JSON.parse(userData);
                        console.log('Current user data (BillCard):', user);
                        
                        // Try different possible user ID fields
                        const currentUserId = user.id || user._id || (user.user && (user.user.id || user.user._id));
                        
                        // Try different possible bill owner ID fields
                        const billOwnerId = billData.userId || billData.user?.id || billData.user?._id || 
                                        (billData.user && (billData.user.id || billData.user._id));
                        
                        console.log('BillCard - Current User ID:', currentUserId);
                        console.log('BillCard - Bill Owner ID:', billOwnerId);
                        
                        // Check if current user is the owner
                        const isOwnerCheck = !!currentUserId && !!billOwnerId && 
                                        (currentUserId === billOwnerId || 
                                         currentUserId.toString() === billOwnerId.toString());
                        
                        console.log('BillCard - Ownership check - isOwner:', isOwnerCheck);
                        
                        // Set isOwner state
                        setIsOwner(isOwnerCheck);
                    } catch (err) {
                        console.error('Error in BillCard ownership check:', err);
                    }
                }
            } catch (err) {
                console.error("Error fetching bill:", err);
                addToast("Failed to load bill details", "error");
                navigate("/bills");
            } finally {
                setLoading(false);
            }
        };

        fetchBill();
    }, [id, navigate, addToast]);

    if (loading || !bill) {
        return (
            <div className="max-w-4xl mx-auto mt-8">
                <Card>
                    <Loader />
                </Card>
            </div>
        );
    }

    // Safely extract metadata and handle potential null/undefined values
    const metadata = bill.metadata || {};
    const vendorName = metadata?.vendorName || "Not specified";
    const billDate = bill.purchaseDate || metadata?.date || "Not specified";
    const displayTitle = bill.productName || bill.filename || "Bill Details";
    const items = metadata?.items || [];

    return (
        <div className="max-w-4xl mx-auto mt-8">
            <SectionHeader title={displayTitle} />
            <Card className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            Bill Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Product Name
                                </p>
                                <p className="text-gray-800 mb-4">
                                    {bill.productName || "Not specified"}
                                </p>

                                <p className="text-sm font-medium text-gray-500">
                                    Category
                                </p>
                                <p className="text-gray-800 mb-4">
                                    {bill.category || "Not specified"}
                                </p>

                                <p className="text-sm font-medium text-gray-500">
                                    Vendor
                                </p>
                                <p className="text-gray-800">{vendorName}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Bill Date
                                </p>
                                <p className="text-gray-800">
                                    {billDate && billDate !== "Not specified"
                                        ? new Date(
                                              billDate
                                          ).toLocaleDateString()
                                        : "Not specified"}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Original Filename
                                </p>
                                <p className="text-gray-800 break-all">
                                    {bill.filename}
                                </p>
                            </div>
                            {bill.purchaseDate &&
                                bill.purchaseDate !== billDate && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">
                                            Purchase Date
                                        </p>
                                        <p className="text-gray-800">
                                            {new Date(
                                                bill.purchaseDate
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            {bill.warrantyPeriod && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Warranty Period
                                    </p>
                                    <p className="text-gray-800">
                                        {bill.warrantyPeriod}{" "}
                                        {bill.warrantyPeriod === 1
                                            ? "month"
                                            : "months"}
                                    </p>
                                </div>
                            )}
                            {bill.category && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Category
                                    </p>
                                    <p className="text-gray-800 capitalize">
                                        {bill.category}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                            Bill Preview
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-auto">
                            {bill.path &&
                            bill.path.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                <img
                                    src={`http://localhost:3001/${bill.path}`}
                                    alt={bill.filename}
                                    className="max-w-full h-auto max-h-56 mx-auto"
                                    onError={(e) => {
                                        // Fallback to text if image fails to load
                                        const target =
                                            e.target as HTMLImageElement;
                                        target.style.display = "none";
                                        const textPreview =
                                            document.createElement("pre");
                                        textPreview.className =
                                            "whitespace-pre-wrap font-sans text-sm text-gray-700";
                                        textPreview.textContent =
                                            bill.rawText ||
                                            "No content available";
                                        target.parentNode?.appendChild(
                                            textPreview
                                        );
                                    }}
                                />
                            ) : bill.rawText ? (
                                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                                    {bill.rawText}
                                </pre>
                            ) : (
                                <p className="text-gray-500 text-center my-8">
                                    No preview available
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {bill.notes && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Notes</h3>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-gray-800 whitespace-pre-line">
                                {bill.notes}
                            </p>
                        </div>
                    </div>
                )}

                {isOwner && (
                    <div className="flex justify-end space-x-4 mt-8">
                        <button
                            onClick={() => navigate(`/bills/${id}/edit`)}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Edit Bill</span>
                        </button>
                        <button
                            onClick={() => setShareModalOpen(true)}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                />
                            </svg>
                            <span>Share Bill</span>
                        </button>
                    </div>
                )}

                <ShareBillModal
                    isOpen={shareModalOpen}
                    onClose={() => setShareModalOpen(false)}
                    billId={bill.id}
                    billName={displayTitle}
                />
            </Card>
        </div>
    );
};

export default BillCard;
