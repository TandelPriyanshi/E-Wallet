import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { useToast, ToastAction } from '../ui/Toast';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { addToast } = useToast();

  const handleLogout = () => {
    // @ts-ignore - We know the Toast component can handle these options
    addToast('Are you sure you want to log out?', 'confirm', {
      actions: [
        {
          label: 'Cancel',
          onClick: () => {
            // Navigate to dashboard if user cancels
            navigate('/dashboard');
          },
          variant: 'secondary'
        },
        {
          label: 'Logout',
          onClick: () => {
            localStorage.removeItem('token');
            // @ts-ignore
            addToast('You have been logged out successfully', 'success');
            navigate('/login');
          },
          variant: 'danger'
        }
      ],
      autoDismiss: false
    });
  };

  const activeClassName =
    'border-indigo-500 text-indigo-600 inline-flex items-center px-3 py-2 border-b-2 text-sm font-semibold transition-all duration-200';
  const inactiveClassName =
    'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-all duration-200';


  return (
    <motion.nav 
      className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <NavLink to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all duration-300">
                  eWallet
                </NavLink>
              </motion.div>
            </div>
            <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
              {token ? (
                <>
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      isActive ? activeClassName : inactiveClassName
                    }
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      isActive ? activeClassName : inactiveClassName
                    }
                  >
                    Profile
                  </NavLink>
                  <NavLink
                    to="/upload"
                    className={({ isActive }) =>
                      isActive ? activeClassName : inactiveClassName
                    }
                  >
                    Upload Bill
                  </NavLink>
                  <NavLink
                    to="/bills"
                    className={({ isActive }) =>
                      isActive ? activeClassName : inactiveClassName
                    }
                  >
                    My Bills
                  </NavLink>
                  <NavLink
                    to="/shared-bills"
                    className={({ isActive }) =>
                      isActive ? activeClassName : inactiveClassName
                    }
                  >
                    Shared Bills
                  </NavLink>
                  <NavLink
                    to="/search"
                    className={({ isActive }) =>
                      isActive ? activeClassName : inactiveClassName
                    }
                  >
                    Search
                  </NavLink>
                  <NavLink
                    to="/ocr"
                    className={({ isActive }) =>
                      isActive ? activeClassName : inactiveClassName
                    }
                  >
                    OCR
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      isActive ? activeClassName : inactiveClassName
                    }
                  >
                    Register
                  </NavLink>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      isActive ? activeClassName : inactiveClassName
                    }
                  >
                    Login
                  </NavLink>
                </>
              )}
            </div>
            {token && (
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <motion.button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Logout
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;

