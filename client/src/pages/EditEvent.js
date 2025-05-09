import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../contexts/AuthContext';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user, loading: authLoading } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!user || !response.data) {
          navigate('/');
          return;
        }

        // Check if current user is the organizer
        const organizerCheck = response.data.organizer_id.toString() === user.id.toString();
        setIsOrganizer(organizerCheck);

        if (!organizerCheck) {
          navigate('/');
          return;
        }

        setEvent({
          ...response.data,
          date: response.data.date.slice(0, 16)
        });
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err.response?.data?.error || 'Failed to load event');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, user, navigate, authLoading, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!isOrganizer) {
        setError('You are not authorized to edit this event');
        return;
      }

      const response = await axios.put(
        `http://localhost:5000/api/events/${id}`,
        event,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.status === 200) {
        navigate(`/events/${id}`);
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.error || 'Failed to update event');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent(prev => ({
      ...prev,
      [name]: name === 'max_seats' ? parseInt(value) : value
    }));
  };

  if (authLoading || loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!event) return null;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={event.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1">Description</label>
          <textarea
            name="description"
            value={event.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="4"
          />
        </div>
        
        <div>
          <label className="block mb-1">Date</label>
          <input
            type="datetime-local"
            name="date"
            value={event.date}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={event.location}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1">Max Seats</label>
          <input
            type="number"
            name="max_seats"
            value={event.max_seats}
            onChange={handleChange}
            min="1"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Update Event
        </button>
      </form>
    </div>
  );
}