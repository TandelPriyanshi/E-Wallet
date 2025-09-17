import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import SectionHeader from '../../components/ui/SectionHeader';
import Empty from '../../components/ui/Empty';
import { useToast } from '../../components/ui/Toast';
import api from '../../services/api';

interface SharedBill {
  id: number;
  bill: {
    id: number;
    filename: string;
    productName?: string;
    category?: string;
    createdAt: string;
  };
  owner: {
    id: number;
    email: string;
    name?: string;
  };
  sharedWith: {
    id: number;
    email: string;
    name?: string;
  };
  permissionLevel: string;
  sharedAt: string;
  isActive: boolean;
}

const SharedBills: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [sharedBills, setSharedBills] = useState<SharedBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'shared_with_me' | 'shared_by_me'>('shared_with_me');

  const fetchSharedBills = async (type: 'shared_with_me' | 'shared_by_me') => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const res = await api.get(`/api/shared-bills?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const responseData = res.data?.data || res.data;
      const billsData = responseData?.sharedBills || [];
      setSharedBills(billsData);
    } catch (err) {
      console.error('Error fetching shared bills:', err);
      setError('Failed to load shared bills. Please try again.');
      setSharedBills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedBills(activeTab);
  }, [activeTab]);

  const handleTabChange = (tab: 'shared_with_me' | 'shared_by_me') => {
    setActiveTab(tab);
  };

  const handleViewBill = (sharedBill: SharedBill) => {
    // Navigate to a special shared bill view or regular bill view
    navigate(`/bills/${sharedBill.bill.id}`);
  };

  const handleRevokeBill = async (sharedBillId: number) => {
    // @ts-ignore - We know the Toast component can handle these options
    addToast('Are you sure you want to revoke sharing for this bill?', 'confirm', {
      actions: [
        {
          label: 'Cancel',
          onClick: () => {
            // Do nothing, just close the toast
          },
          variant: 'secondary'
        },
        {
          label: 'Revoke',
          onClick: async () => {
            try {
              const token = localStorage.getItem('token');
              await api.delete(`/api/shared-bills/${sharedBillId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              
              // Remove from local state
              setSharedBills(prev => prev.filter(sb => sb.id !== sharedBillId));
              // @ts-ignore
              addToast('Bill sharing revoked successfully', 'success');
            } catch (error) {
              console.error('Error revoking shared bill:', error);
              // @ts-ignore
              addToast('Failed to revoke bill sharing', 'error');
            }
          },
          variant: 'danger'
        }
      ],
      autoDismiss: true,
      timeout: 10000
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      x: -100,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div 
      className="max-w-6xl mx-auto mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <SectionHeader title="Shared Bills" />
      
      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => handleTabChange('shared_with_me')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'shared_with_me'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Shared with Me
          </button>
          <button
            onClick={() => handleTabChange('shared_by_me')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'shared_by_me'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Shared by Me
          </button>
        </nav>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
            <button 
              onClick={() => fetchSharedBills(activeTab)}
              className="mt-2 text-indigo-600 hover:underline"
            >
              Retry
            </button>
          </div>
        ) : sharedBills.length === 0 ? (
          <Empty 
            title={activeTab === 'shared_with_me' ? 'No bills shared with you' : 'You haven\'t shared any bills'} 
            description={activeTab === 'shared_with_me' ? 'When someone shares a bill with you, it will appear here.' : 'Share bills with other users to see them here.'} 
          />
        ) : (
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {sharedBills.map((sharedBill) => (
                <motion.div
                  key={sharedBill.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold text-sm">
                              📄
                            </span>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {sharedBill.bill.productName || sharedBill.bill.filename}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>
                              {activeTab === 'shared_with_me' 
                                ? `Shared by ${sharedBill.owner.email}`
                                : `Shared with ${sharedBill.sharedWith.email}`
                              }
                            </span>
                            <span>•</span>
                            <span>{formatDate(sharedBill.sharedAt)}</span>
                            {sharedBill.bill.category && (
                              <>
                                <span>•</span>
                                <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">
                                  {sharedBill.bill.category}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {sharedBill.permissionLevel}
                      </span>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewBill(sharedBill)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          View
                        </button>
                        
                        {activeTab === 'shared_by_me' && (
                          <button
                            onClick={() => handleRevokeBill(sharedBill.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default SharedBills;
