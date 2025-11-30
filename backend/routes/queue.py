# backend/routes/queue.py
from flask import Blueprint, jsonify, request
from utils.validators import require_auth
from utils.errors import APIError
from supabase_client import supabase

queue_bp = Blueprint('queue', __name__)

@queue_bp.route('/join', methods=['POST'])
@require_auth
def join_queue():
    """Add user to matchmaking queue"""
    user_id = request.user_id
    data = request.get_json() or {}
    mode = data.get('mode', 'ranked')  # Default to ranked
    
    # Validate mode
    if mode not in ['ranked', 'casual']:
        raise APIError('Invalid mode. Must be "ranked" or "casual"', 400)
    
    try:
        # FIX 1: Check if user has any active matches first
        active_match = supabase.table('matches')\
            .select('*')\
            .eq('status', 'active')\
            .or_(f'player1_id.eq.{user_id},player2_id.eq.{user_id}')\
            .execute()
        
        if active_match.data:
            return jsonify({
                'status': 'has_active_match',
                'message': 'You already have an active match',
                'match_id': active_match.data[0]['id']
            }), 400
        
        # FIX 2: Remove any existing queue entries for this user (cleanup)
        # This ensures no duplicate entries if something went wrong
        supabase.table('match_queue')\
            .delete()\
            .eq('profile_id', user_id)\
            .execute()
        
        # Check if already in queue (after cleanup, should be none)
        existing = supabase.table('match_queue')\
            .select('*')\
            .eq('profile_id', user_id)\
            .execute()
        
        if existing.data:
            return jsonify({
                'status': 'already_in_queue',
                'message': 'Already in queue'
            })
        
        # Add to queue with mode
        result = supabase.table('match_queue').insert({
            'profile_id': user_id,
            'mode': mode
        }).execute()
        
        return jsonify({
            'status': 'success',
            'queue_entry': result.data[0],
            'mode': mode
        })
        
    except Exception as e:
        raise APIError(f'Failed to join queue: {str(e)}', 500)

@queue_bp.route('/leave', methods=['POST'])
@require_auth
def leave_queue():
    """Remove user from matchmaking queue"""
    user_id = request.user_id
    
    try:
        supabase.table('match_queue')\
            .delete()\
            .eq('profile_id', user_id)\
            .execute()
        
        return jsonify({
            'status': 'success',
            'message': 'Left queue'
        })
        
    except Exception as e:
        raise APIError(f'Failed to leave queue: {str(e)}', 500)

@queue_bp.route('/status', methods=['GET'])
@require_auth
def queue_status():
    """Check if user is in queue or has a match"""
    user_id = request.user_id
    
    try:
        # FIX 3: First check for active match
        match_result = supabase.table('matches')\
            .select('*')\
            .eq('status', 'active')\
            .or_(f'player1_id.eq.{user_id},player2_id.eq.{user_id}')\
            .execute()
        
        active_match = match_result.data[0] if match_result.data else None
        
        # FIX 4: If user has active match, remove them from queue automatically
        if active_match:
            # Cleanup: remove from queue if somehow still there
            supabase.table('match_queue')\
                .delete()\
                .eq('profile_id', user_id)\
                .execute()
            
            return jsonify({
                'in_queue': False,
                'queue_mode': None,
                'active_match': active_match
            })
        
        # Check queue only if no active match
        queue_result = supabase.table('match_queue')\
            .select('*')\
            .eq('profile_id', user_id)\
            .execute()
        
        in_queue = len(queue_result.data) > 0
        queue_mode = queue_result.data[0]['mode'] if in_queue else None
        
        return jsonify({
            'in_queue': in_queue,
            'queue_mode': queue_mode,
            'active_match': None
        })
        
    except Exception as e:
        raise APIError(f'Failed to get queue status: {str(e)}', 500)

# Custom mode endpoints
@queue_bp.route('/custom/create', methods=['POST'])
@require_auth
def create_custom_match():
    """Create a custom match with invite code"""
    user_id = request.user_id
    
    try:
        # FIX 5: Check for active matches before creating custom match
        active_match = supabase.table('matches')\
            .select('*')\
            .eq('status', 'active')\
            .or_(f'player1_id.eq.{user_id},player2_id.eq.{user_id}')\
            .execute()
        
        if active_match.data:
            raise APIError('You already have an active match', 400)
        
        # Get a random problem
        problem_result = supabase.table('problems')\
            .select('id')\
            .execute()
        
        if not problem_result.data:
            raise APIError('No problems available', 500)
        
        import random
        problem_id = random.choice(problem_result.data)['id']
        
        # Generate unique invite code
        max_attempts = 10
        invite_code = None
        
        for _ in range(max_attempts):
            # Generate code
            code_result = supabase.rpc('generate_invite_code').execute()
            temp_code = code_result.data
            
            # Check if code already exists
            existing = supabase.table('matches')\
                .select('id')\
                .eq('invite_code', temp_code)\
                .execute()
            
            if not existing.data:
                invite_code = temp_code
                break
        
        if not invite_code:
            raise APIError('Failed to generate unique invite code', 500)
        
        # Create match in "pending" state waiting for player 2
        match_data = {
            'player1_id': user_id,
            'player2_id': user_id,  # Temporary, will be updated when player 2 joins
            'problem_id': problem_id,
            'status': 'pending',
            'mode': 'custom',
            'invite_code': invite_code,
            'player1_result': {},
            'player2_result': {}
        }
        
        match_result = supabase.table('matches').insert(match_data).execute()
        
        return jsonify({
            'status': 'success',
            'match_id': match_result.data[0]['id'],
            'invite_code': invite_code,
            'message': 'Share this code with your friend!'
        })
        
    except Exception as e:
        raise APIError(f'Failed to create custom match: {str(e)}', 500)

@queue_bp.route('/custom/join', methods=['POST'])
@require_auth
def join_custom_match():
    """Join a custom match using invite code"""
    user_id = request.user_id
    data = request.get_json()
    
    if not data or 'invite_code' not in data:
        raise APIError('invite_code is required', 400)
    
    invite_code = data['invite_code'].upper().strip()
    
    try:
        # FIX 6: Check for active matches before joining custom match
        active_match = supabase.table('matches')\
            .select('*')\
            .eq('status', 'active')\
            .or_(f'player1_id.eq.{user_id},player2_id.eq.{user_id}')\
            .execute()
        
        if active_match.data:
            raise APIError('You already have an active match', 400)
        
        # Find match with this invite code
        match_result = supabase.table('matches')\
            .select('*')\
            .eq('invite_code', invite_code)\
            .eq('status', 'pending')\
            .execute()
        
        if not match_result.data:
            raise APIError('Invalid or expired invite code', 404)
        
        match = match_result.data[0]
        
        # Check if user is trying to join their own match
        if match['player1_id'] == user_id:
            raise APIError('Cannot join your own custom match', 400)
        
        # Update match with player 2 and activate
        update_result = supabase.table('matches')\
            .update({
                'player2_id': user_id,
                'status': 'active'
            })\
            .eq('id', match['id'])\
            .execute()
        
        return jsonify({
            'status': 'success',
            'match_id': match['id'],
            'message': 'Joined custom match!'
        })
        
    except APIError:
        raise
    except Exception as e:
        raise APIError(f'Failed to join custom match: {str(e)}', 500)