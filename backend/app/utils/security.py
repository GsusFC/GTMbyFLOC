from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from flask import jsonify

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            current_user = get_jwt_identity()
            if current_user['role'] != 'admin':
                return jsonify({"msg": "Admin access required"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def designer_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            current_user = get_jwt_identity()
            if current_user['role'] not in ['designer', 'admin']:
                return jsonify({"msg": "Designer access required"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper 