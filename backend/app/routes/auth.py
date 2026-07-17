from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app.models import AdminUser
import bcrypt

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password required'}), 400

    user = AdminUser.query.filter_by(username=data['username']).first()
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401

    if not bcrypt.checkpw(data['password'].encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({'access_token': token, 'user': user.to_dict()}), 200


@auth_bp.route('/logout', methods=['POST'])
def logout():
    # JWT is stateless; client discards token
    return jsonify({'message': 'Logged out successfully'}), 200
