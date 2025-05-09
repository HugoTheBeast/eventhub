import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyBookings, cancelBooking } from '../services/BookingService';
import AuthContext from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const MyBookings = () => {
    const { user, token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchBookings = async () => {
            try {
                const bookingsData = await fetchMyBookings(token);
                setBookings(bookingsData);
            } catch (error) {
                toast.error('Failed to load bookings');
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [user, token, navigate]);

    const handleCancel = async (bookingId) => {
        try {
            await cancelBooking(bookingId, token);
            toast.success('Booking cancelled successfully');
            setBookings(bookings.filter(booking => booking.id !== bookingId));
        } catch (error) {
            toast.error('Failed to cancel booking');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
            {bookings.length === 0 ? (
                <p>You have no bookings yet.</p>
            ) : (
                <div className="space-y-4">
                    {bookings.map(booking => (
                        <div key={booking.id} className="border p-4 rounded-lg shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-semibold">{booking.event_title}</h2>
                                    <p className="text-gray-600">
                                        {new Date(booking.event_date).toLocaleString()}
                                    </p>
                                    <p className="mt-2">Seats: {booking.seat_count}</p>
                                    <p className="text-sm text-gray-500">
                                        Booked on: {new Date(booking.booking_date).toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleCancel(booking.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookings;