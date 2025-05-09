import React, { useContext } from 'react';
import { Calendar, MapPin, Users, Edit, Trash2 } from 'lucide-react';
import AuthContext from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event, onDelete }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/events/edit/${event.id}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await onDelete(event.id);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <div 
      onClick={() => navigate(`/events/${event.id}`)}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative"
    >
      {/* Edit/Delete buttons for organizer */}
      {user?.id === event.organizer_id && (
        <div className="absolute top-2 left-2 flex space-x-2 z-10">
          <button 
            onClick={handleEdit}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            aria-label="Edit event"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={handleDelete}
            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            aria-label="Delete event"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Event card content */}
      <div className="h-48 relative">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-white/90 rounded-full px-3 py-1 text-sm font-medium">
          ${event.price}
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            event.available_seats > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {event.available_seats > 0 ? `${event.available_seats} seats left` : 'Sold out'}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        
        <div className="flex flex-wrap text-sm text-gray-600 mb-4 gap-y-2">
          <div className="flex items-center mr-6">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDate(event.date)}
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            {event.location}
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <Users className="w-4 h-4 mr-2" />
          {event.category}
        </div>
      </div>
    </div>
  );
};

export default EventCard;