from .. import db
from datetime import datetime

class File(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    url = db.Column(db.String(512), nullable=False)
    file_type = db.Column(db.String(50))  # mime type
    uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'url': self.url,
            'file_type': self.file_type,
            'created_at': self.created_at.isoformat()
        } 