from flask import Blueprint, jsonify, request
from utils.validators import require_auth

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/verify', methods=['GET'])
@require_auth
def verify():
    """Verify token validity"""
    return jsonify({
        'status': 'success',
        'user_id': request.user_id
    })