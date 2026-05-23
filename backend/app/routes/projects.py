from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.project import Project
from ..models.user import User
from ..models.subscription import Subscription
from ..utils.validators import validate_project_title
from ..utils.security import designer_required
from .. import db
from sqlalchemy.sql import func

bp = Blueprint('projects', __name__, url_prefix='/api/projects')

@bp.route('', methods=['GET'])
@jwt_required()
def get_projects():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role == 'client':
        projects = Project.query.filter_by(client_id=user_id).all()
    elif user.role == 'designer':
        projects = Project.query.filter_by(designer_id=user_id).all()
    else:  # admin
        projects = Project.query.all()
        
    return jsonify([p.to_dict() for p in projects])

@bp.route('', methods=['POST'])
@jwt_required()
def create_project():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        
        # Verificar suscripción activa
        subscription = Subscription.query.filter_by(
            user_id=user_id,
            is_active=True
        ).first()
        
        if not subscription:
            return jsonify({'error': 'Active subscription required'}), 403
            
        if subscription.credits <= 0:
            return jsonify({'error': 'No credits available'}), 403
        
        # Validar título
        title_valid, title_error = validate_project_title(data.get('title', ''))
        if not title_valid:
            return jsonify({'error': title_error}), 400
            
        project = Project(
            client_id=user_id,
            title=data['title'],
            brief=data.get('brief', {}),
        )
        
        # Asignar diseñador automáticamente
        available_designer = User.query.filter_by(
            role='designer',
            is_active=True
        ).order_by(func.random()).first()
        
        if available_designer:
            project.designer_id = available_designer.id
        
        db.session.add(project)
        
        # Descontar crédito
        subscription.credits -= 1
        
        db.session.commit()
        
        # Enviar notificaciones
        send_project_notification(project.client, project, 'created')
        if project.designer:
            send_project_notification(project.designer, project, 'assigned')
        
        return jsonify(project.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    project = Project.query.get_or_404(project_id)
    return jsonify(project.to_dict())

@bp.route('/<int:project_id>/status', methods=['PUT'])
@jwt_required()
@designer_required()
def update_project_status(project_id):
    data = request.get_json()
    project = Project.query.get_or_404(project_id)
    
    if data.get('status') not in ['pending', 'in_progress', 'review', 'completed']:
        return jsonify({'error': 'Invalid status'}), 400
        
    project.status = data['status']
    db.session.commit()
    
    return jsonify(project.to_dict()) 