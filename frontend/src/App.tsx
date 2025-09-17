import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './features/auth/Register';
import Login from './features/auth/Login';
import Profile from './features/profile/Profile';
import BillUpload from './features/bills/BillUpload';
import BillList from './features/bills/BillList';
import BillDetails from './features/bills/BillDetails';
import BillCard from './features/bills/BillCard';
import SharedBills from './features/bills/SharedBills';
import Dashboard from './features/dashboard/Dashboard';
import Search from './features/search/Search';
import OCRPage from './features/OCR/OCRPage';
import AppLayout from './layouts/AppLayout';
import { ToastProvider } from './components/ui/Toast';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize token state from localStorage
    const storedToken = localStorage.getItem('token');
    console.log('App initializing with token:', storedToken ? storedToken.substring(0, 20) + '...' : 'No token');
    setToken(storedToken);
    setIsLoading(false);

    // Listen for storage changes (e.g., login/logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      console.log('Storage change detected:', e.key, e.newValue ? 'Token set' : 'Token removed');
      if (e.key === 'token') {
        setToken(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Debug token changes
  useEffect(() => {
    console.log('App token state changed:', token ? token.substring(0, 20) + '...' : 'No token');
  }, [token]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/upload" element={<BillUpload />} />
            <Route path="/bills" element={<BillList />} />
            <Route path="/bills/:id" element={<BillCard />} />
            <Route path="/bills/:id/edit" element={<BillDetails />} />
            <Route path="/shared-bills" element={<SharedBills />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search" element={<Search />} />
            <Route path="/ocr" element={<OCRPage />} />
          </Routes>
        </AppLayout>
      </Router>
    </ToastProvider>
  );
}

export default App;
