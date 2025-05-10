# server/routes/events.py
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models import Event, User, db
from extensions import db

event_bp = Blueprint('events', __name__)
 
@event_bp.before_request
def handle_options():
    if request.method == "OPTIONS":
        response = jsonify({"message": "Preflight OK"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        return response

# Get all events (public)
@event_bp.route("", methods=["GET", "OPTIONS"])
def get_events():
    if request.method == "OPTIONS":
        return {}, 200
        
    events = Event.query.all()
    return jsonify([event.to_dict() for event in events]), 200

# Create event (organizer only)
@event_bp.route('', methods=['POST', 'OPTIONS'])
@jwt_required()
def create_event():
    if request.method == "OPTIONS":
        return {}, 200
        
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or not user.is_organizer:
            return jsonify({'error': 'Unauthorized'}), 403

        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'date', 'location', 'max_seats', 'category', 'price']
        if not all(field in data for field in required_fields):
            return jsonify({
                'error': 'Missing required fields',
                'required_fields': required_fields
            }), 400
        
        # Validate field types and constraints
        if int(data['max_seats']) <= 0:
            return jsonify({'error': 'max_seats must be positive'}), 400
            
        if float(data['price']) < 0:
            return jsonify({'error': 'price cannot be negative'}), 400
            
        event_date = datetime.fromisoformat(data['date'])
        if event_date <= datetime.utcnow():
            return jsonify({'error': 'Event date must be in the future'}), 400
        
        # Create the event
        event = Event(
            title=data['title'],
            description=data.get('description', ''),
            date=event_date,
            location=data['location'],
            max_seats=int(data['max_seats']),
            available_seats=int(data['max_seats']),
            organizer_id=current_user_id,
            category=data['category'],
            price=float(data['price'])
        )
        
        db.session.add(event)
        db.session.commit()
        
        return jsonify({
            'message': 'Event created successfully',
            'event': event.to_dict()
        }), 201
        
    except ValueError as e:
        db.session.rollback()
        return jsonify({'error': 'Invalid data format', 'details': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating event: {str(e)}")
        return jsonify({'error': 'Server error', 'details': str(e)}), 500
    
# Get single event (public)
@event_bp.route("/<int:event_id>", methods=["GET", "OPTIONS"])
def get_event(event_id):
    if request.method == "OPTIONS":
        return {}, 200
        
    event = Event.query.get_or_404(event_id)
    return jsonify(event.to_dict()), 200

# Update event (organizer only)
@event_bp.route("/<int:event_id>", methods=["PUT", "OPTIONS"])
@jwt_required()
def update_event(event_id):
    if request.method == "OPTIONS":
        return {}, 200
        
    event = Event.query.get_or_404(event_id)
    current_user_id = get_jwt_identity()
    
    current_app.logger.debug(f"Update event attempt - Event ID: {event_id}, Organizer ID: {event.organizer_id}, Current User ID: {current_user_id}")

    if str(event.organizer_id) != str(current_user_id):
        current_app.logger.warning(f"Unauthorized attempt to edit event {event_id} by user {current_user_id}")
        return jsonify({
            "error": "Unauthorized: Not the event organizer",
            "details": {
                "event_organizer": event.organizer_id,
                "current_user": current_user_id
            }
        }), 403

    data = request.get_json()
    try:
        if 'title' in data:
            event.title = data['title']
        if 'description' in data:
            event.description = data['description']
        if 'date' in data:
            new_date = datetime.fromisoformat(data['date'])
            if new_date <= datetime.utcnow():
                return jsonify({"error": "Event date must be in the future"}), 400
            event.date = new_date
        if 'location' in data:
            event.location = data['location']
        if 'max_seats' in data:
            new_max = int(data['max_seats'])
            if new_max <= 0:
                return jsonify({"error": "max_seats must be positive"}), 400
            if new_max < (event.max_seats - event.available_seats):
                return jsonify({"error": "Cannot reduce seats below booked count"}), 400
            event.available_seats += new_max - event.max_seats
            event.max_seats = new_max
        
        db.session.commit()
        current_app.logger.info(f"Event {event_id} updated successfully by user {current_user_id}")
        return jsonify(event.to_dict()), 200
    except ValueError as e:
        db.session.rollback()
        current_app.logger.error(f"ValueError in update_event: {str(e)}")
        return jsonify({
            "error": "Invalid data format",
            "details": str(e)
        }), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating event {event_id}: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Delete event (organizer only)
@event_bp.route("/<int:event_id>", methods=["DELETE", "OPTIONS"])
@jwt_required()
def delete_event(event_id):
    if request.method == "OPTIONS":
        response = jsonify({"message": "Preflight OK"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "DELETE,OPTIONS")
        return response
        
    current_app.logger.debug(f"Delete request for event {event_id}")
    
    event = Event.query.get_or_404(event_id)
    current_user_id = get_jwt_identity()

    current_app.logger.debug(f"User {current_user_id} attempting to delete event {event_id} (organizer: {event.organizer_id})")

    if str(event.organizer_id) != str(current_user_id):
        current_app.logger.warning(f"Unauthorized delete attempt by user {current_user_id}")
        return jsonify({
            "error": "Unauthorized: Not the event organizer",
            "details": {
                "event_organizer": event.organizer_id,
                "current_user": current_user_id
            }
        }), 403

    try:
        # Check if there are any bookings for this event
        if event.bookings:
            return jsonify({
                "error": "Cannot delete event with existing bookings",
                "bookings_count": len(event.bookings)
            }), 422

        db.session.delete(event)
        db.session.commit()
        
        current_app.logger.info(f"Event {event_id} deleted successfully")
        return jsonify({
            "message": "Event deleted successfully",
            "deleted_event_id": event_id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting event {event_id}: {str(e)}")
        return jsonify({
            "error": "Failed to delete event",
            "details": str(e)
        }), 500