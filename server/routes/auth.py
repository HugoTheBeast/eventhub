from werkzeug.security import generate_password_hash, check_password_hash
from flask import Blueprint, request, jsonify, current_app
from extensions import db
from models import User
from datetime import timedelta
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    
    # Enhanced input validation
    required_fields = {'email': str, 'password': str, 'name': str}
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields", "required": list(required_fields.keys())}), 400

    # Validate email format
    if '@' not in data['email']:
        return jsonify({"error": "Invalid email format"}), 400

    try:
        new_user = User(
            email=data['email'].lower().strip(),  # Normalize email
            name=data['name'].strip(),
            is_organizer=data.get('is_organizer', False)
        )
        new_user.set_password(data['password'])
        
        db.session.add(new_user)
        db.session.commit()
        
        # Create token immediately after registration
        access_token = create_access_token(
            identity=new_user.id,
            additional_claims={
                "email": new_user.email,
                "is_organizer": new_user.is_organizer
            },
            expires_delta=timedelta(days=1))
        
        return jsonify({
            "message": "User registered successfully",
            "access_token": access_token,
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "is_organizer": new_user.is_organizer
            }
        }), 201
        
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Email already exists"}), 409
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Registration error: {str(e)}")
        return jsonify({"error": "Registration failed"}), 500
    
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    
    if not data or not all(field in data for field in ["email", "password"]):
        return jsonify({"error": "Email and password required"}), 400

    try:
        user = User.query.filter_by(email=data["email"].lower().strip()).first()

        if not user or not user.check_password(data["password"]):
            return jsonify({"error": "Invalid email or password"}), 401

        # Create JWT token with consistent identity
        access_token = create_access_token(
            identity=str(user.id),  # Using database ID as identity
            additional_claims={
                "email": user.email,
                "is_organizer": user.is_organizer
            },
            expires_delta=timedelta(days=1)
        )

        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'is_organizer': user.is_organizer
            }
        }), 200
    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        return jsonify({"error": "Login failed"}), 500

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        return jsonify({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "is_organizer": user.is_organizer
        }), 200
    except Exception as e:
        current_app.logger.error(f"Get current user error: {str(e)}")
        return jsonify({"error": "Unable to fetch user data"}), 500