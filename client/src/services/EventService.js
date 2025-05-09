// client/src/services/EventService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const fetchEvents = async () => {
  try {
    const response = await axios.get(`${API_URL}/events`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchEventById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/events/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createEvent = async (eventData, token) => {
  try {
    const response = await axios.post(`${API_URL}/events`, eventData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateEvent = async (id, eventData, token) => {
  try {
    const response = await axios.put(`${API_URL}/events/${id}`, eventData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteEvent = async (id, token) => {
  try {
    const response = await axios.delete(`${API_URL}/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};