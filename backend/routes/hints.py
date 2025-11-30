# backend/routes/hints.py
from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from typing import Optional
from utils.validators import require_auth, validate_match_participant
from utils.errors import APIError
from supabase_client import supabase
from config import Config
import traceback

# Conditional import - only import if GOOGLE_API_KEY is set
try:
    from services.hint_service import hint_service
    HINT_SERVICE_AVAILABLE = True
except Exception as e:
    print(f"Warning: Hint service not available: {str(e)}")
    HINT_SERVICE_AVAILABLE = False

hints_bp = Blueprint('hints', __name__)

def get_hint_limits(mode: str) -> dict:
    """Get hint limits based on match mode"""
    limits = {
        'ranked': {
            'allowed': False,
            'limit': 0,
            'message': 'Hints are disabled in ranked mode'
        },
        'casual': {
            'allowed': True,
            'limit': Config.CASUAL_HINT_LIMIT,
            'message': f'Limited to {Config.CASUAL_HINT_LIMIT} hints'
        },
        'custom': {
            'allowed': True,
            'limit': 'unlimited',
            'message': 'Unlimited hints available'
        },
        'practice': {
            'allowed': True,
            'limit': 'unlimited',
            'message': 'Unlimited hints available'
        }
    }
    return limits.get(mode, limits['ranked'])

def check_cooldown(match_id: str, user_id: str) -> Optional[float]:
    """Check if user is in cooldown period. Returns remaining seconds or None"""
    try:
        result = supabase.table('matches')\
            .select('hint_metadata')\
            .eq('id', match_id)\
            .execute()
        
        if not result.data or len(result.data) == 0:
            return None
        
        match_data = result.data[0]
        hint_metadata = match_data.get('hint_metadata')
        
        # Handle None or empty metadata
        if not hint_metadata or not isinstance(hint_metadata, dict):
            return None
        
        last_request_key = f'last_request_{user_id}'
        last_request = hint_metadata.get(last_request_key)
        
        if not last_request:
            return None
        
        # Parse ISO format datetime
        try:
            last_time = datetime.fromisoformat(last_request.replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            return None
        
        cooldown_end = last_time + timedelta(seconds=Config.HINT_COOLDOWN_SECONDS)
        now = datetime.utcnow()
        
        if now < cooldown_end:
            return (cooldown_end - now).total_seconds()
        
        return None
        
    except Exception as e:
        print(f"Cooldown check error: {str(e)}")
        traceback.print_exc()
        return None

def update_cooldown(match_id: str, user_id: str):
    """Update the cooldown timestamp for this user"""
    try:
        result = supabase.table('matches')\
            .select('hint_metadata')\
            .eq('id', match_id)\
            .execute()
        
        hint_metadata = {}
        if result.data and len(result.data) > 0:
            existing_metadata = result.data[0].get('hint_metadata')
            if existing_metadata and isinstance(existing_metadata, dict):
                hint_metadata = existing_metadata.copy()
        
        hint_metadata[f'last_request_{user_id}'] = datetime.utcnow().isoformat()
        
        supabase.table('matches')\
            .update({'hint_metadata': hint_metadata})\
            .eq('id', match_id)\
            .execute()
            
    except Exception as e:
        print(f"Cooldown update error: {str(e)}")
        traceback.print_exc()

@hints_bp.route('/<match_id>/status', methods=['GET'])
@require_auth
def get_hint_status(match_id):
    """Get hint availability and usage for this match"""
    user_id = request.user_id
    
    try:
        # Validate match participant
        match = validate_match_participant(match_id, user_id, supabase)
        
        # Get match mode - handle None case
        match_mode = match.get('mode')
        if not match_mode:
            match_mode = 'ranked'
        
        limits = get_hint_limits(match_mode)
        
        if not limits['allowed']:
            return jsonify({
                'allowed': False,
                'message': limits['message']
            })
        
        # Determine which player
        is_player1 = match.get('player1_id') == user_id
        hint_count_key = 'player1_hint_count' if is_player1 else 'player2_hint_count'
        
        # Handle None values safely
        current_count = match.get(hint_count_key)
        if current_count is None:
            current_count = 0
        
        # Calculate remaining hints
        if limits['limit'] == 'unlimited':
            can_request = True
            remaining = 'unlimited'
        else:
            remaining = max(0, limits['limit'] - current_count)
            can_request = remaining > 0
        
        # Check cooldown
        cooldown_remaining = check_cooldown(match_id, user_id)
        if cooldown_remaining and cooldown_remaining > 0:
            can_request = False
        
        return jsonify({
            'allowed': True,
            'can_request_more': can_request and HINT_SERVICE_AVAILABLE,
            'hints_used': current_count,
            'hints_limit': limits['limit'],
            'hints_remaining': remaining,
            'cooldown_remaining': cooldown_remaining or 0,
            'message': limits['message']
        })
        
    except APIError as e:
        raise e
    except Exception as e:
        print(f"Hint status error: {str(e)}")
        traceback.print_exc()
        raise APIError(f'Failed to get hint status: {str(e)}', 500)

@hints_bp.route('/<match_id>/request', methods=['POST'])
@require_auth
def request_hint(match_id):
    """Request a hint for the current problem"""
    user_id = request.user_id
    data = request.get_json()
    
    if not data:
        raise APIError('Request body required', 400)
    
    if not HINT_SERVICE_AVAILABLE:
        raise APIError('Hint service is not available. Please check GOOGLE_API_KEY configuration.', 503)
    
    user_code = data.get('user_code', '')
    execution_output = data.get('execution_output', '')
    error_messages = data.get('error_messages', '')
    
    try:
        # Validate match participant
        match = validate_match_participant(match_id, user_id, supabase)
        
        # Get match mode
        match_mode = match.get('mode', 'ranked')
        limits = get_hint_limits(match_mode)
        
        if not limits['allowed']:
            raise APIError(limits['message'], 403)
        
        # Get problem details
        problem = supabase.table('problems')\
            .select('*')\
            .eq('id', match['problem_id'])\
            .single()\
            .execute()
        
        if not problem.data:
            raise APIError('Problem not found', 404)
        
        problem_data = problem.data
        
        # Check hint limit
        is_player1 = match['player1_id'] == user_id
        hint_count_key = 'player1_hint_count' if is_player1 else 'player2_hint_count'
        current_count = match.get(hint_count_key) or 0
        
        if limits['limit'] != 'unlimited' and current_count >= limits['limit']:
            raise APIError(f"Hint limit reached ({limits['limit']} hints used)", 403)
        
        # Check cooldown
        cooldown_remaining = check_cooldown(match_id, user_id)
        if cooldown_remaining and cooldown_remaining > 0:
            raise APIError(
                f"Please wait {cooldown_remaining:.1f}s before requesting another hint",
                429
            )
        
        # Generate hint using AI
        hint = hint_service.generate_hint(
            problem_title=problem_data.get('title', 'Problem'),
            problem_description=problem_data.get('description', ''),
            user_code=user_code,
            execution_output=execution_output,
            error_messages=error_messages
        )
        
        # Update hint count
        new_count = current_count + 1
        update_data = {hint_count_key: new_count}
        
        # Store hint in history
        hint_history_key = 'player1_hint_history' if is_player1 else 'player2_hint_history'
        current_history = match.get(hint_history_key) or []
        
        # Ensure it's a list
        if not isinstance(current_history, list):
            current_history = []
        
        current_history.append({
            'hint': hint,
            'timestamp': datetime.utcnow().isoformat(),
            'code_length': len(user_code)
        })
        update_data[hint_history_key] = current_history
        
        # Update match
        supabase.table('matches')\
            .update(update_data)\
            .eq('id', match_id)\
            .execute()
        
        # Update cooldown
        update_cooldown(match_id, user_id)
        
        # Calculate remaining hints
        if limits['limit'] == 'unlimited':
            remaining = 'unlimited'
        else:
            remaining = limits['limit'] - new_count
        
        return jsonify({
            'status': 'success',
            'hint': hint,
            'hints_used': new_count,
            'hints_remaining': remaining,
            'hint_info': {
                'can_request_more': remaining != 0,
                'cooldown_seconds': Config.HINT_COOLDOWN_SECONDS,
                'message': f"Hint {new_count} of {limits['limit']}" if limits['limit'] != 'unlimited' else 'Hint generated'
            }
        })
        
    except APIError:
        raise
    except Exception as e:
        print(f"Hint request error: {str(e)}")
        traceback.print_exc()
        raise APIError(f'Failed to generate hint: {str(e)}', 500)

@hints_bp.route('/<match_id>/history', methods=['GET'])
@require_auth
def get_hint_history(match_id):
    """Get all hints requested by the user in this match"""
    user_id = request.user_id
    
    try:
        match = validate_match_participant(match_id, user_id, supabase)
        
        is_player1 = match['player1_id'] == user_id
        hint_history_key = 'player1_hint_history' if is_player1 else 'player2_hint_history'
        
        history = match.get(hint_history_key) or []
        
        # Ensure it's a list
        if not isinstance(history, list):
            history = []
        
        return jsonify({
            'status': 'success',
            'hints': history,
            'total_hints': len(history)
        })
        
    except APIError:
        raise
    except Exception as e:
        print(f"Hint history error: {str(e)}")
        traceback.print_exc()
        raise APIError(f'Failed to get hint history: {str(e)}', 500)