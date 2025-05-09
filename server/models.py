from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'  # Explicit table name (good practice)
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    is_organizer = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Use UTC
    
    # Relationship to events
    events = db.relationship('Event', backref='organizer', lazy=True)

    def get_id(self):
        return str(self.id)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# models.py (updated Event model)
class Event(db.Model):
    __tablename__ = 'events'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)  # Made non-nullable
    date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(120), nullable=False)
    max_seats = db.Column(db.Integer, nullable=False)
    available_seats = db.Column(db.Integer, nullable=False)
    organizer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    category = db.Column(db.String(50), nullable=False)  # Made non-nullable
    image = db.Column(db.String(255), nullable=False)  # Added for event images
    price = db.Column(db.Numeric(10, 2), nullable=False)  # Added for ticket price
    
    # Relationships
    bookings = db.relationship('Booking', backref='event', lazy=True, cascade="all, delete")

    def __repr__(self):
        return f'<Event {self.title}>'

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'date': self.date.isoformat(),
            'location': self.location,
            'max_seats': self.max_seats,
            'available_seats': self.available_seats,
            'organizer_id': self.organizer_id,
            'created_at': self.created_at.isoformat(),
            'category': self.category,
            'image': self.image,
            'price': float(self.price) if self.price else 0.0  # Convert Decimal to float
        }

class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    seat_count = db.Column(db.Integer, nullable=False)
    booking_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Define relationships
    user = db.relationship('User', backref=db.backref('bookings', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'event_id': self.event_id,
            'seat_count': self.seat_count,
            'booking_date': self.booking_date.isoformat()
        }