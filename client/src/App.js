import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import Register from './pages/Register';
import EditEvent from './pages/EditEvent';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/create-event" element={
              <ProtectedRoute requiredRole="organizer">
                <CreateEvent />
              </ProtectedRoute>
            } />
            
            <Route path="/my-bookings" element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            } />
            
            <Route path="/events/edit/:id" element={
              <ProtectedRoute requiredRole="organizer">
                <EditEvent />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;