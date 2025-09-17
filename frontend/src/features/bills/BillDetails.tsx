import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import SectionHeader from '../../components/ui/SectionHeader';
import Loader from '../../components/ui/Loader';
import { useToast } from '../../components/ui/Toast';

interface Bill {
  id: number;
  filename: string;
  text: string;
  productName: string;
  purchaseDate: string;
  warrantyPeriod: number;
  notes: string;
  category: string;
}

const BillDetails: React.FC = () => {
  const [bill, setBill] = useState<Bill | null>(null);
  const [productName, setProductName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyPeriod, setWarrantyPeriod] = useState(0);
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('');

  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  
  // Get current user ID from localStorage or token
  useEffect(() => {
    const userData = localStorage.getItem('user');
    console.log('Raw user data from localStorage:', userData);
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('Parsed user object:', user);
        // Try different possible user ID fields
        const userId = user.id || user._id || (user.user && (user.user.id || user.user._id));
        console.log('Extracted user ID:', userId);
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchBill = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching bill with ID:', id);
        console.log('Using token:', token ? 'Token exists' : 'No token found');
        
        const res = await api.get(`/api/bills/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log('API Response:', res.data);
        
        const billData = res.data?.data?.bill || res.data?.bill || res.data;
        if (!billData) throw new Error('No bill data received');

        console.log('Full bill data:', billData);
        
        setBill(billData);
        setProductName(billData.productName || '');
        setPurchaseDate(billData.purchaseDate || '');
        setWarrantyPeriod(billData.warrantyPeriod || 0);
        setNotes(billData.notes || '');
        setCategory(billData.category || '');

        // Get current user data
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            console.log('Current user data:', user);
            
            // Try different possible user ID fields
            const currentUserId = user.id || user._id || (user.user && (user.user.id || user.user._id));
            
            // Try different possible bill owner ID fields
            const billOwnerId = billData.userId || billData.user?.id || billData.user?._id || 
                              (billData.user && (billData.user.id || billData.user._id));
            
            console.log('Current User ID:', currentUserId);
            console.log('Bill Owner ID:', billOwnerId);
            
            // Check if current user is the owner
            const isOwnerCheck = !!currentUserId && !!billOwnerId && 
                              (currentUserId === billOwnerId || 
                               currentUserId.toString() === billOwnerId.toString());
            
            // Check if bill is shared with current user
            const isSharedCheck = billData.sharedWith && 
                               Array.isArray(billData.sharedWith) &&
                               billData.sharedWith.some((id: any) => 
                                 id.toString() === currentUserId?.toString()
                               );
            
            console.log('Ownership check - isOwner:', isOwnerCheck, 'isShared:', isSharedCheck);
          } catch (err) {
            console.error('Error in ownership check:', err);
          }
        }
        setProductName(res.data.productName || '');
        setPurchaseDate(res.data.purchaseDate || '');
        setWarrantyPeriod(res.data.warrantyPeriod || 0);
        setNotes(res.data.notes || '');
        setCategory(res.data.category || '');
      } catch (err) {
        console.error('Error fetching bill:', err);
        addToast('Failed to load bill details', 'error');
      }
    };
    fetchBill();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const billId = id || bill?.id?.toString();
    if (!billId) return;
    try {
      const token = localStorage.getItem('token');
      await api.put(
        `/api/bills/${billId}`,
        { productName, purchaseDate, warrantyPeriod, notes, category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      addToast('Bill details updated successfully!', 'success');
      window.location.href = '/bills';
    } catch (err) {
      console.error(err);
      addToast('Failed to update bill details.', 'error');
    }
  };

  if (!bill) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <Card>
          <Loader />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <SectionHeader title={bill.filename} />
      <Card className="p-6">
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Scanned Text</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{bill.text}</p>
        </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="productName">
                  Product Name
                </label>
                <input
                  className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  id="productName"
                  type="text"
                  placeholder="Product Name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="purchaseDate">
                  Purchase Date
                </label>
                <input
                  className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  id="purchaseDate"
                  type="date"
                  placeholder="Purchase Date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="warrantyPeriod">
                  Warranty Period (months)
                </label>
                <input
                  className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  id="warrantyPeriod"
                  type="number"
                  placeholder="Warranty Period (months)"
                  value={warrantyPeriod}
                  onChange={(e) => setWarrantyPeriod(parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="category">
                  Category
                </label>
                <input
                  className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  id="category"
                  type="text"
                  placeholder="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  id="notes"
                  placeholder="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded"
                type="submit"
              >
                Save
              </button>
            </div>
          </form>
      </Card>
    </div>
  );
};

export default BillDetails;

