from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.subscription import Subscription
from ..models.user import User
from .. import db
from datetime import datetime, timedelta

bp = Blueprint('subscriptions', __name__, url_prefix='/api/subscriptions')

@bp.route('/plans', methods=['GET'])
def get_plans():
    plans = {
        'basic': {
            'name': 'Basic Plan',
            'credits': 2,
            'price': 99,
            'features': [
                '2 projects per month',
                'Basic support',
                'Standard delivery'
            ]
        },
        'pro': {
            'name': 'Pro Plan',
            'credits': 5,
            'price': 199,
            'features': [
                '5 projects per month',
                'Priority support',
                'Fast delivery',
                'Advanced features'
            ]
        }
    }
    return jsonify(plans)

@bp.route('', methods=['POST'])
@jwt_required()
def create_subscription():
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        
        # Validar plan
        if data.get('plan_type') not in ['basic', 'pro']:
            return jsonify({'error': 'Invalid plan type'}), 400
            
        # Verificar si ya tiene una suscripción activa
        active_sub = Subscription.query.filter_by(
            user_id=user_id,
            is_active=True
        ).first()
        
        if active_sub:
            # Si la suscripción actual no ha expirado, calcular créditos restantes
            if active_sub.end_date > datetime.utcnow():
                remaining_days = (active_sub.end_date - datetime.utcnow()).days
                remaining_credits = int((remaining_days / 30) * active_sub.credits)
            else:
                remaining_credits = 0
            
            active_sub.is_active = False
            db.session.flush()
        
        # Crear nueva suscripción
        credits = 2 if data['plan_type'] == 'basic' else 5
        subscription = Subscription(
            user_id=user_id,
            plan_type=data['plan_type'],
            credits=credits + (remaining_credits if active_sub else 0),
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=30)
        )
        
        db.session.add(subscription)
        db.session.commit()
        
        return jsonify(subscription.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/current', methods=['GET'])
@jwt_required()
def get_current_subscription():
    user_id = get_jwt_identity()
    subscription = Subscription.query.filter_by(
        user_id=user_id,
        is_active=True
    ).first()
    
    if not subscription:
        return jsonify({'error': 'No active subscription'}), 404
        
    return jsonify(subscription.to_dict()) 