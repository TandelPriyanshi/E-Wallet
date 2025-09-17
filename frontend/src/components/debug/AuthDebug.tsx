import React, { useEffect, useState } from 'react';

const AuthDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState({
    token: '',
    user: '',
    timestamp: ''
  });

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      setDebugInfo({
        token: token ? `${token.substring(0, 20)}...` : 'No token',
        user: user ? JSON.parse(user).email || 'No email' : 'No user',
        timestamp: new Date().toLocaleTimeString()
      });
    };

    // Check immediately
    checkAuth();

    // Check every second
    const interval = setInterval(checkAuth, 1000);

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">Auth Debug</h4>
      <div><strong>Token:</strong> {debugInfo.token}</div>
      <div><strong>User:</strong> {debugInfo.user}</div>
      <div><strong>Last check:</strong> {debugInfo.timestamp}</div>
    </div>
  );
};

export default AuthDebug;
