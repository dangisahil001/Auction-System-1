import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiBell, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-600">
              AuctionHub
            </Link>
            <div className="hidden md:flex ml-10 space-x-4">
              <Link to="/auctions" className="text-gray-600 hover:text-primary-600 px-3 py-2">
                Auctions
              </Link>
              {isAuthenticated && user?.role === 'seller' && (
                <Link to="/my-auctions" className="text-gray-600 hover:text-primary-600 px-3 py-2">
                  My Auctions
                </Link>
              )}
              {isAuthenticated && user?.role === 'admin' && (
                <Link to="/admin" className="text-gray-600 hover:text-primary-600 px-3 py-2">
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/notifications" className="relative text-gray-600 hover:text-primary-600">
                  <FiBell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="flex items-center text-gray-600 hover:text-primary-600">
                  <FiUser size={20} />
                  <span className="ml-2">{user?.firstName}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-primary-600"
                >
                  <FiLogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-primary-600">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-2">
            <Link
              to="/auctions"
              className="block py-2 text-gray-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Auctions
            </Link>
            {isAuthenticated ? (
              <>
                {user?.role === 'seller' && (
                  <Link
                    to="/my-auctions"
                    className="block py-2 text-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Auctions
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block py-2 text-gray-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/notifications"
                  className="block py-2 text-gray-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </Link>
                <Link
                  to="/profile"
                  className="block py-2 text-gray-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block py-2 text-gray-600 w-full text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 text-gray-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block py-2 text-gray-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
