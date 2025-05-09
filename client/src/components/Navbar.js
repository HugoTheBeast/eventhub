import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold">
              EventHub
            </Link>
            
            {token && (
              <>
                <Link to="/events" className="hover:bg-blue-500 px-3 py-2 rounded">
                  Events
                </Link>
                <Link to="/my-bookings" className="hover:bg-blue-500 px-3 py-2 rounded">
                  My Bookings
                </Link>
                {user?.is_organizer && (
                  <Link to="/create-event" className="hover:bg-blue-500 px-3 py-2 rounded">
                    Create Event
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {token ? (
              <>
                <span className="text-sm">Hello, {user?.name}</span>
                {user?.is_organizer && (
                  <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded">
                    Organizer
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:bg-blue-500 px-3 py-2 rounded">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-blue-600 hover:bg-gray-100 px-3 py-2 rounded"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;