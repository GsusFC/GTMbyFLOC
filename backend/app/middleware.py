from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt
import re

def validate_json():
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not request.is_json:
                return jsonify({"error": "Missing JSON in request"}), 400
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def sanitize_input():
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if request.is_json:
                data = request.get_json()
                for key, value in data.items():
                    if isinstance(value, str):
                        # Eliminar caracteres peligrosos
                        data[key] = re.sub(r'[<>]', '', value)
                request._cached_json = (data, request._cached_json[1])
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def rate_limit():
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Implementar rate limiting aquí
            return f(*args, **kwargs)
        return decorated_function
    return decorator 