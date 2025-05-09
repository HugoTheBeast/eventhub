// client/src/pages/EventDetails.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchEventById, deleteEvent } from '../services/EventService';
import AuthContext from '../contexts/AuthContext';
import BookingForm from '../components/BookingForm';
import EventCard from '../components/EventCard';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventData = await fetchEventById(id);
        setEvent(eventData);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleBookingSuccess = (availableSeats) => {
    setEvent(prev => ({
      ...prev,
      available_seats: availableSeats
    }));
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(id, token);
        navigate('/events');
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleEdit = () => {
    navigate(`/events/edit/${id}`);
  };

  if (loading) return <div className="max-w-4xl mx-auto p-4">Loading...</div>;
  if (!event) return <div className="max-w-4xl mx-auto p-4">Event not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* Event Card Display */}
      <div className="max-w-2xl mx-auto">
        <EventCard 
          event={event} 
          onClick={() => {}} // Override default click behavior
          showActions={false} // Disable actions in details view
        />
      </div>

      {/* Detailed Information and Booking Form */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Event Details</h2>
          <div className="space-y-2">
            <p><strong>Description:</strong> {event.description}</p>
            <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p><strong>Available Seats:</strong> {event.available_seats}</p>
            <p><strong>Category:</strong> {event.category}</p>
            <p><strong>Price:</strong> ${event.price}</p>
          </div>

          {/* Organizer Actions */}
          {user?.id === event.organizer_id && (
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit Event
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete Event
              </button>
            </div>
          )}
        </div>

        {/* Booking Form */}
        {user && !user.is_organizer && event.available_seats > 0 && (
          <BookingForm event={event} onBookingSuccess={handleBookingSuccess} />
        )}
      </div>
    </div>
  );
};

export default EventDetails;