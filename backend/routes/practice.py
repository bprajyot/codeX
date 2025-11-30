# FILE: backend/routes/practice.py
from flask import Blueprint, jsonify, request
from utils.validators import require_auth
from utils.errors import APIError
from supabase_client import supabase

practice_bp = Blueprint('practice', __name__)

@practice_bp.route('/create', methods=['POST'])
@require_auth
def create_practice():
    """Create a solo practice session"""
    user_id = request.user_id
    data = request.get_json()
    
    if not data or 'problem_id' not in data:
        raise APIError('problem_id is required', 400)
    
    problem_id = data['problem_id']
    
    try:
        # Verify problem exists
        problem_result = supabase.table('problems')\
            .select('id')\
            .eq('id', problem_id)\
            .single()\
            .execute()
        
        if not problem_result.data:
            raise APIError('Problem not found', 404)
        
        # Create a practice "match" with only player1
        # player2 is set to same user to satisfy FK constraint
        # but we mark it as practice mode
        match_data = {
            'player1_id': user_id,
            'player2_id': user_id,  # Same user for practice
            'problem_id': problem_id,
            'status': 'active',
            'mode': 'practice',  # Mark as practice
            'player1_result': {},
            'player2_result': {}
        }
        
        match_result = supabase.table('matches').insert(match_data).execute()
        
        return jsonify({
            'status': 'success',
            'match_id': match_result.data[0]['id'],
            'message': 'Practice session created'
        })
        
    except APIError:
        raise
    except Exception as e:
        raise APIError(f'Failed to create practice session: {str(e)}', 500)