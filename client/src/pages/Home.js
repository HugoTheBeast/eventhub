import React, { useContext } from "react";
import AuthContext from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  //console.log("User object:", JSON.stringify(user, null, 2));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center mb-12 p-4 bg-white rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold text-indigo-600">EventHub</h1>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-gray-700 font-medium">Hello, {user.name}</span>
              {user.is_organizer && (
                <button
                  onClick={() => navigate("/create-event")}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create Event
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {user?.isOrganizer ? "Organizer Dashboard" : "Welcome to EventHub"}
          </h2>
          <p className="text-gray-600 mb-6">
            {user
              ? user.is_organizer
                ? "Manage your events and attendees"
                : "Discover amazing events near you"
              : "Please login to access your events and bookings."}
          </p>

          {user && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                onClick={() => navigate("/events")}
                className="bg-indigo-50 p-6 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors"
              >
                <h3 className="text-xl font-semibold text-indigo-700 mb-2">
                  {user.is_organizer ? "My Events" : "Browse Events"}
                </h3>
                <p className="text-gray-600">
                  {user.is_organizer ? "Manage your hosted events" : "Find exciting events near you"}
                </p>
              </div>

              <div 
                onClick={() => navigate("/my-bookings")}
                className="bg-green-50 p-6 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
              >
                <h3 className="text-xl font-semibold text-green-700 mb-2">My Bookings</h3>
                <p className="text-gray-600">View your upcoming events</p>
              </div>

              {/* Only show Create Event card for organizers */}
              {user.is_organizer && (
                <div 
                  onClick={() => navigate("/create-event")}
                  className="bg-purple-50 p-6 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-purple-700 mb-2">Create Event</h3>
                  <p className="text-gray-600">Host a new event</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upgrade prompt - only show for non-organizer users */}
        {user && !user.is_organizer && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Become an Organizer</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Want to host your own events? Upgrade to an organizer account.
            </p>
            <button
              onClick={() => navigate("/become-organizer")}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-lg font-medium"
            >
              Upgrade Account
            </button>
          </div>
        )}

        {/* Guest User Section */}
        {!user && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Join Our Community</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Create an account to discover amazing events.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-lg font-medium"
            >
              Register Now
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;