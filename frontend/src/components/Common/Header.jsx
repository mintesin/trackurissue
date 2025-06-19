import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectIsAuthenticated, selectRole, selectUser } from '../../store/slices/authSlice';
import axios from 'axios';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectRole);
  const user = useSelector(selectUser);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [errorNotifications, setErrorNotifications] = useState(null);

  // Fetch notifications on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
    // eslint-disable-next-line
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    setErrorNotifications(null);
    try {
      const res = await axios.get('/api/notifications?unread=true');
      setNotifications(res.data || []);
    } catch (err) {
      setErrorNotifications('Failed to load notifications');
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null; // Don't show header for unauthenticated users
  }

  return (
    <header className="bg-indigo-600">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-white text-lg font-semibold">Issue Tracker</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {/* Company Admin Links */}
                {userRole === 'company' && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Company Dashboard
                    </Link>
                  </>
                )}

                {/* Employee/Team Leader Links */}
                {(userRole === 'employee' || userRole === 'teamLeader') && (
                  <Link
                    to="/employee/dashboard"
                    className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Team Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {/* User Info */}
              <div className="flex items-center">
                {/* Notification Bell */}
                <div className="relative mr-4">
                  <button
                    onClick={() => setShowNotifications((prev) => !prev)}
                    className="relative focus:outline-none"
                    aria-label="Show notifications"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {notifications.length > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded shadow-lg z-50 max-h-96 overflow-y-auto">
                      <div className="p-2 border-b font-semibold text-gray-700 flex justify-between items-center">
                        Notifications
                        <button onClick={fetchNotifications} className="text-xs text-blue-600 hover:underline">Refresh</button>
                      </div>
                      {loadingNotifications && <div className="p-2 text-gray-500">Loading...</div>}
                      {errorNotifications && <div className="p-2 text-red-500">{errorNotifications}</div>}
                      {(!loadingNotifications && notifications.length === 0) && <div className="p-2 text-gray-500">No new notifications</div>}
                      {notifications.map((n) => (
                        <div key={n._id} className="p-2 border-b last:border-b-0 flex items-start gap-2 hover:bg-gray-100">
                          <div className="flex-1">
                            <div className="text-sm text-gray-800">{n.message}</div>
                            <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
                          </div>
                          <button
                            onClick={() => markNotificationRead(n._id)}
                            className="ml-2 text-xs text-blue-600 hover:underline"
                          >
                            Mark as read
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-white mr-4">
                  {user?.name || user?.email} ({userRole})
                </span>
                <button
                  onClick={handleLogout}
                  className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="bg-indigo-600 inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-indigo-500 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon for menu */}
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {userRole === 'company' && (
            <Link
              to="/admin/dashboard"
              className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium"
            >
              Company Dashboard
            </Link>
          )}

          {(userRole === 'employee' || userRole === 'teamLeader') && (
            <Link
              to="/employee/dashboard"
              className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium"
            >
              Team Dashboard
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="text-white hover:bg-indigo-500 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
