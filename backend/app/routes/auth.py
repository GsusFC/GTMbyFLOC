from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..models.user import User
from ..utils.validators import validate_email, validate_password
from .. import db
from datetime import datetime

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validar datos
    email_valid, email_error = validate_email(data.get('email', ''))
    password_valid, password_error = validate_password(data.get('password', ''))
    
    if not email_valid:
        return jsonify({'error': email_error}), 400
    if not password_valid:
        return jsonify({'error': password_error}), 400
        
    # Verificar si el usuario ya existe
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
        
    # Crear nuevo usuario
    user = User(
        email=data['email'],
        name=data.get('name', ''),
        company=data.get('company', ''),
        role=data.get('role', 'client')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Generar token
    token = create_access_token(identity=user.id)
    
    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validar que los campos existan
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=data.get('email')).first()
    if not user or not user.check_password(data.get('password')):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Actualizar último login
    user.last_login = datetime.utcnow()
    db.session.commit()
        
    token = create_access_token(
        identity=user.id,
        additional_claims={'role': user.role}
    )
    
    return jsonify({
        'token': token,
        'user': user.to_dict()
    })

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    return jsonify(user.to_dict()) 