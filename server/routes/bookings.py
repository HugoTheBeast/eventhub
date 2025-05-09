# server/routes/bookings.py
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from extensions import db
from models import Booking, Event, User

booking_bp = Blueprint('bookings', __name__)

@booking_bp.before_request
def handle_options():
    if request.method == "OPTIONS":
        response = jsonify({"message": "Preflight OK"})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS")
        return response

@booking_bp.route('', methods=['POST', 'OPTIONS'])
@jwt_required()
def create_booking():
    if request.method == "OPTIONS":
        return {}, 200
        
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate request data
    if not data or 'event_id' not in data or 'seat_count' not in data:
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        event_id = int(data['event_id'])
        seat_count = int(data['seat_count'])
    except ValueError:
        return jsonify({"error": "Invalid data format"}), 400
    
    # Validate seat count
    if seat_count <= 0:
        return jsonify({"error": "Seat count must be positive"}), 400
    
    # Check if event exists and has available seats
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404
    
    if event.available_seats < seat_count:
        return jsonify({
            "error": "Not enough seats available",
            "available_seats": event.available_seats
        }), 400
    
    try:
        # Create booking
        new_booking = Booking(
            user_id=current_user_id,
            event_id=event_id,
            seat_count=seat_count
        )
        
        # Update available seats
        event.available_seats -= seat_count
        
        db.session.add(new_booking)
        db.session.commit()
        
        return jsonify({
            "message": "Booking created successfully",
            "booking": new_booking.to_dict(),
            "available_seats": event.available_seats
        }), 201
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Booking creation error: {str(e)}")
        return jsonify({"error": "Failed to create booking"}), 500

@booking_bp.route('/my', methods=['GET', 'OPTIONS'])
@jwt_required()
def get_my_bookings():
    if request.method == "OPTIONS":
        return {}, 200
        
    current_user_id = get_jwt_identity()
    
    try:
        bookings = db.session.query(
            Booking,
            Event.title.label('event_title'),
            Event.date.label('event_date')
        ).join(
            Event, Booking.event_id == Event.id
        ).filter(
            Booking.user_id == current_user_id
        ).all()
        
        result = []
        for booking, event_title, event_date in bookings:
            result.append({
                "id": booking.id,
                "seat_count": booking.seat_count, 
                "booking_date": booking.booking_date.isoformat(),
                "event_title": event_title,
                "event_date": event_date.isoformat(),
                "event_id": booking.event_id
            })
            
        return jsonify(result), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching bookings: {str(e)}")
        return jsonify({"error": "Failed to fetch bookings"}), 500

@booking_bp.route('/<int:booking_id>', methods=['DELETE', 'OPTIONS'])
@jwt_required()
def cancel_booking(booking_id):
    if request.method == "OPTIONS":
        return {}, 200
        
    current_user_id = get_jwt_identity()
    booking = Booking.query.get_or_404(booking_id)
    
    # Debug logging
    current_app.logger.debug(f"Current user: {current_user_id}, Booking user: {booking.user_id}")
    
    if str(booking.user_id) != str(current_user_id):
        current_app.logger.warning(f"Unauthorized cancel attempt by user {current_user_id}")
        return jsonify({
            "error": "Unauthorized: You can only cancel your own bookings",
            "user_id": current_user_id,
            "booking_user_id": booking.user_id
        }), 403
    
    try:
        event = Event.query.get(booking.event_id)
        if event:
            event.available_seats += booking.seat_count
        
        db.session.delete(booking)
        db.session.commit()
        
        return jsonify({
            "message": "Booking cancelled successfully",
            "available_seats": event.available_seats if event else 0
        }), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Booking cancellation error: {str(e)}")
        return jsonify({"error": "Failed to cancel booking"}), 500