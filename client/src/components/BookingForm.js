// client/src/components/BookingForm.js
import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { createBooking } from '../services/BookingService';
import AuthContext from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const BookingForm = ({ event, onBookingSuccess }) => {
  const { id: eventId } = useParams();
  const [seats, setSeats] = useState(1);
  const { token } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await createBooking(eventId, seats, token);
      toast.success('Booking successful!');
      onBookingSuccess(result.available_seats);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Booking failed');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-4">
      <h3 className="text-lg font-semibold mb-2">Book Tickets</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block mb-1">Number of Seats</label>
          <input
            type="number"
            min="1"
            max={event.available_seats}
            value={seats}
            onChange={(e) => setSeats(Math.min(parseInt(e.target.value) || 1, event.available_seats))}
            className="w-full p-2 border rounded"
            required
          />
          <p className="text-sm text-gray-600 mt-1">
            {event.available_seats} seats available
          </p>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Book Now
        </button>
      </form>
    </div>
  );
};

export default BookingForm;