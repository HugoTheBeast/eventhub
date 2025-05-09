from flask import Flask
from dotenv import load_dotenv
import os
from extensions import db, migrate, jwt
from flask_cors import CORS
import logging

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app, resources={
        r"/api/*": {
            "origins": "http://localhost:3000",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Add OPTIONS
            "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "expose_headers": ["Authorization"]
        }

    })
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URI")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("SECRET_KEY")

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Import and register blueprints within app context
    with app.app_context():
        from routes.auth import auth_bp
        from routes.events import event_bp
        from routes.bookings import booking_bp
        app.register_blueprint(auth_bp, url_prefix="/api/auth")
        app.register_blueprint(event_bp, url_prefix="/api/events")
        app.register_blueprint(booking_bp, url_prefix="/api/bookings")
    return app

app = create_app()

@app.route("/")
def home():
    return "EventHub API is running!"

if __name__ == "__main__":
    app.logger.setLevel(logging.DEBUG)
    app.run(debug=True)