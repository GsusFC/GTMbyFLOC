from .. import db
from datetime import datetime

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    designer_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    title = db.Column(db.String(200), nullable=False)
    brief = db.Column(db.JSON)
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, review, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    comments = db.relationship('Comment', backref='project', lazy=True)
    files = db.relationship('File', backref='project', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'brief': self.brief,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'client': self.client.to_dict(),
            'designer': self.designer.to_dict() if self.designer else None
        } 