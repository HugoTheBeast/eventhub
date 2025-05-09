// client/src/pages/Events.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import { fetchEvents } from '../services/EventService';
import EventCard from '../components/EventCard';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch events on component mount
  useEffect(() => {
    const getEvents = async () => {
      try {
        const data = await fetchEvents();
        setEvents(data);
      } catch (err) {
        setError('Failed to load events');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getEvents();
  }, []);

  // Handler for when an event is deleted
  const handleEventDeleted = (deletedEventId) => {
    setEvents(events.filter(event => event.id !== deletedEventId));
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading events...</div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center p-6 bg-red-100 rounded-lg mb-6">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Upcoming Events</h1>
        {user && user.is_organizer && (
          <button
            onClick={() => navigate('/create-event')}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded"
          >
            Create Event
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="text-center p-12 bg-gray-100 rounded-lg">
          <p className="text-xl text-gray-600">No events available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              onDelete={handleEventDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;