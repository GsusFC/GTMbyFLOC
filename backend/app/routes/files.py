from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
from ..models.file import File
from ..models.project import Project
from .. import db
import uuid

bp = Blueprint('files', __name__, url_prefix='/api/projects/<int:project_id>/files')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx'}
UPLOAD_FOLDER = 'uploads'

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('', methods=['GET'])
@jwt_required()
def get_files(project_id):
    project = Project.query.get_or_404(project_id)
    files = File.query.filter_by(project_id=project_id).all()
    return jsonify([file.to_dict() for file in files])

@bp.route('', methods=['POST'])
@jwt_required()
def upload_file(project_id):
    try:
        project = Project.query.get_or_404(project_id)
        
        # Verificar permisos
        current_user_id = get_jwt_identity()
        if project.client_id != current_user_id and project.designer_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        # Validar tamaño del archivo
        if len(file.read()) > 16 * 1024 * 1024:  # 16MB
            return jsonify({'error': 'File too large'}), 400
        file.seek(0)  # Reset file pointer
            
        if file and allowed_file(file.filename):
            # Crear directorio si no existe
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            
            # Generar nombre único
            filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            
            try:
                file.save(file_path)
            except Exception as e:
                return jsonify({'error': 'Error saving file'}), 500
            
            db_file = File(
                project_id=project_id,
                name=file.filename,
                url=f'/uploads/{filename}',
                file_type=file.content_type,
                uploaded_by=current_user_id
            )
            
            db.session.add(db_file)
            db.session.commit()
            
            return jsonify(db_file.to_dict()), 201
            
        return jsonify({'error': 'File type not allowed'}), 400
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 