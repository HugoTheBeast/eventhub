// client/src/services/BookingService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const createBooking = async (eventId, seats, token) => {
  try {
    const response = await axios.post(`${API_URL}/bookings`, {
      event_id: eventId,
      seat_count: seats
    }, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchMyBookings = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/bookings/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const cancelBooking = async (bookingId, token) => {
    try {
      const response = await axios.delete(`${API_URL}/bookings/${bookingId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        throw {
          message: error.response.data?.error || 'Failed to cancel booking',
          status: error.response.status,
          data: error.response.data
        };
      } else if (error.request) {
        // The request was made but no response was received
        throw { message: 'No response from server' };
      } else {
        // Something happened in setting up the request
        throw { message: error.message };
      }
    }
  };