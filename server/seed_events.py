# backend/seed_events.py
from datetime import datetime, timedelta
from models import db, Event, User
from app import create_app

app = create_app()
app.app_context().push()

# Sample organizer user (if doesn't exist)
organizer = User.query.filter_by(email='organizer@demo.com').first()
if not organizer:
    organizer = User(
        email='organizer@demo.com',
        name='Demo Organizer',
        is_organizer=True
    )
    organizer.set_password('demo123')
    db.session.add(organizer)
    db.session.commit()

# Sample events data
sample_events = [
    {
        "title": "Tech Conference 2023",
        "description": "Annual technology conference featuring industry leaders and workshops",
        "date": datetime.utcnow() + timedelta(days=10),
        "location": "Convention Center, San Francisco",
        "max_seats": 200,
        "available_seats": 150,
        "category": "Technology",
        "image": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678",
        "price": 199.99
    },
    {
        "title": "Jazz Night Under the Stars",
        "description": "Open air jazz concert with local and international artists",
        "date": datetime.utcnow() + timedelta(days=5),
        "location": "Central Park, New York",
        "max_seats": 300,
        "available_seats": 300,
        "category": "Music",
        "image": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
        "price": 45.00
    },
    {
        "title": "Food Festival",
        "description": "Taste cuisine from around the world with top chefs",
        "date": datetime.utcnow() + timedelta(days=15),
        "location": "Waterfront Plaza, Seattle",
        "max_seats": 500,
        "available_seats": 250,
        "category": "Food",
        "image": "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
        "price": 25.00
    },
    {
        "title": "Startup Pitch Competition",
        "description": "Watch emerging startups pitch to investors",
        "date": datetime.utcnow() + timedelta(days=7),
        "location": "Innovation Hub, Austin",
        "max_seats": 150,
        "available_seats": 80,
        "category": "Business",
        "image": "https://images.unsplash.com/photo-1552664730-d307ca884978",
        "price": 75.50
    },
    {
        "title": "Yoga Retreat Weekend",
        "description": "Weekend wellness retreat in the mountains with expert instructors",
        "date": datetime.utcnow() + timedelta(days=20),
        "location": "Mountain Lodge, Colorado",
        "max_seats": 50,
        "available_seats": 30,
        "category": "Health",
        "image": "https://images.unsplash.com/photo-1545205597-3d9d02c29597",
        "price": 299.00
    },
    {
        "title": "Art Exhibition Opening",
        "description": "Contemporary art exhibition featuring local artists",
        "date": datetime.utcnow() + timedelta(days=3),
        "location": "Modern Art Museum, Chicago",
        "max_seats": 200,
        "available_seats": 200,
        "category": "Art",
        "image": "https://images.unsplash.com/photo-1536922246285-4745f6a2c7dc",
        "price": 15.00
    }
]

def seed_events():
    # Check if events already exist
    existing_events = Event.query.count()
    if existing_events > 0:
        print(f"Database already contains {existing_events} events")
        return
    
    # Create events
    for event_data in sample_events:
        event = Event(
            title=event_data["title"],
            description=event_data["description"],
            date=event_data["date"],
            location=event_data["location"],
            max_seats=event_data["max_seats"],
            available_seats=event_data["available_seats"],
            organizer_id=organizer.id,
            category=event_data["category"],
            image=event_data["image"],
            price=event_data["price"]
        )
        db.session.add(event)
    
    db.session.commit()
    print(f"Successfully seeded {len(sample_events)} events")

if __name__ == '__main__':
    seed_events()