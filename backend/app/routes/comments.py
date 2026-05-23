from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.comment import Comment
from ..models.project import Project
from .. import db

bp = Blueprint('comments', __name__, url_prefix='/api/projects/<int:project_id>/comments')

@bp.route('', methods=['GET'])
@jwt_required()
def get_comments(project_id):
    project = Project.query.get_or_404(project_id)
    comments = Comment.query.filter_by(project_id=project_id).order_by(Comment.created_at.desc()).all()
    return jsonify([comment.to_dict() for comment in comments])

@bp.route('', methods=['POST'])
@jwt_required()
def create_comment(project_id):
    project = Project.query.get_or_404(project_id)
    data = request.get_json()
    
    if not data.get('content'):
        return jsonify({'error': 'Content is required'}), 400
        
    comment = Comment(
        project_id=project_id,
        user_id=get_jwt_identity(),
        content=data['content']
    )
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify(comment.to_dict()), 201 