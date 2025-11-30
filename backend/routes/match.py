# backend/routes/match.py
from flask import Blueprint, jsonify, request
from utils.validators import require_auth, validate_match_participant
from utils.errors import APIError
from supabase_client import supabase
import logging

match_bp = Blueprint('match', __name__)
logger = logging.getLogger(__name__)

@match_bp.route('/<match_id>', methods=['GET'])
@require_auth
def get_match(match_id):
    """Get match details"""
    user_id = request.user_id
    
    try:
        match = validate_match_participant(match_id, user_id, supabase)
        
        # Get problem details
        problem = supabase.table('problems')\
            .select('*')\
            .eq('id', match['problem_id'])\
            .single()\
            .execute()
        
        # Get player profiles
        player1 = supabase.table('profiles')\
            .select('id,username,elo')\
            .eq('id', match['player1_id'])\
            .single()\
            .execute()
        
        player2 = supabase.table('profiles')\
            .select('id,username,elo')\
            .eq('id', match['player2_id'])\
            .single()\
            .execute()
        
        return jsonify({
            'match': match,
            'problem': problem.data,
            'player1': player1.data,
            'player2': player2.data
        })
        
    except Exception as e:
        raise APIError(f'Failed to get match: {str(e)}', 500)

@match_bp.route('/<match_id>/submit', methods=['POST'])
@require_auth
def submit_solution(match_id):
    """Submit solution (AI detection temporarily disabled)"""
    user_id = request.user_id

    if not request.is_json:
        raise APIError("Request must be JSON (Content-Type: application/json)", 400)

    data = request.get_json(force=False)
    if not data or not isinstance(data, dict):
        raise APIError("Invalid JSON payload", 400)

    result = data.get('result')
    if not result or not isinstance(result, dict):
        raise APIError("Missing or invalid 'result' field", 400)
    
    try:
        match = validate_match_participant(match_id, user_id, supabase)
        
        if match['status'] != 'active':
            raise APIError('Match is not active', 400)
        
        # Normal submission flow
        is_player1 = match['player1_id'] == user_id
        result_field = 'player1_result' if is_player1 else 'player2_result'
        
        update_data = {result_field: data['result']}
        
        # Check if this is a winning submission
        if data['result'].get('passed_all', False):
            opponent_field = 'player2_result' if is_player1 else 'player1_result'
            opponent_passed = match.get(opponent_field, {}).get('passed_all', False)
            
            if not opponent_passed:
                update_data['winner_id'] = user_id
                update_data['status'] = 'completed'
                update_data['completed_at'] = 'now()'
                
                match_mode = match.get('mode', 'ranked')
                if match_mode == 'ranked':
                    loser_id = match['player2_id'] if is_player1 else match['player1_id']
                    supabase.rpc('update_elo_ratings', {
                        'winner_id': user_id,
                        'loser_id': loser_id
                    }).execute()
                    logger.info(f"[RANKED] ELO updated - Winner: {user_id}, Loser: {loser_id}")
        
        # Update match
        result = supabase.table('matches')\
            .update(update_data)\
            .eq('id', match_id)\
            .execute()
        
        return jsonify({
            'status': 'success',
            'match': result.data[0]
        })
        
    except APIError as e:
        raise e
    except Exception as e:
        logger.error(f"Submit error: {str(e)}")
        raise APIError(f'Failed to submit solution: {str(e)}', 500)

@match_bp.route('/<match_id>/leave', methods=['POST'])
@require_auth
def leave_match(match_id):
    """Leave a match - same as forfeit for active matches"""
    user_id = request.user_id
    
    try:
        match = validate_match_participant(match_id, user_id, supabase)
        
        # If match is already completed, just return success
        if match['status'] != 'active':
            return jsonify({
                'status': 'success',
                'message': 'Match already completed'
            })
        
        # For active matches, this is treated as a forfeit
        # Determine the winner (the opponent)
        winner_id = match['player2_id'] if match['player1_id'] == user_id else match['player1_id']
        
        update_data = {
            'winner_id': winner_id,
            'status': 'completed',
            'completed_at': 'now()'
        }
        
        # Mark the result as forfeited
        is_player1 = match['player1_id'] == user_id
        result_field = 'player1_result' if is_player1 else 'player2_result'
        update_data[result_field] = {
            'forfeited': True,
            'forfeited_at': 'now()'
        }
        
        # Update match
        supabase.table('matches')\
            .update(update_data)\
            .eq('id', match_id)\
            .execute()
        
        # Update ELO for ranked matches
        match_mode = match.get('mode', 'ranked')
        if match_mode == 'ranked':
            supabase.rpc('update_elo_ratings', {
                'winner_id': winner_id,
                'loser_id': user_id
            }).execute()
            logger.info(f"[RANKED] ELO updated after forfeit - Winner: {winner_id}, Loser: {user_id}")
        
        return jsonify({
            'status': 'success',
            'message': 'Left match',
            'winner_id': winner_id
        })
        
    except APIError as e:
        raise e
    except Exception as e:
        logger.error(f"Leave match error: {str(e)}")
        raise APIError(f'Failed to leave match: {str(e)}', 500)

@match_bp.route('/<match_id>/forfeit', methods=['POST'])
@require_auth
def forfeit_match(match_id):
    """Forfeit match - opponent wins (legacy endpoint, use /leave instead)"""
    user_id = request.user_id
    data = request.get_json()
    
    try:
        match = validate_match_participant(match_id, user_id, supabase)
        
        if match['status'] != 'active':
            return jsonify({
                'status': 'success',
                'message': 'Match already completed'
            })
        
        winner_id = data.get('winner_id') if data else None
        if not winner_id:
            winner_id = match['player2_id'] if match['player1_id'] == user_id else match['player1_id']
        
        update_data = {
            'winner_id': winner_id,
            'status': 'completed',
            'completed_at': 'now()'
        }
        
        is_player1 = match['player1_id'] == user_id
        result_field = 'player1_result' if is_player1 else 'player2_result'
        update_data[result_field] = {'forfeited': True, 'forfeited_at': 'now()'}
        
        supabase.table('matches')\
            .update(update_data)\
            .eq('id', match_id)\
            .execute()
        
        match_mode = match.get('mode', 'ranked')
        if match_mode == 'ranked':
            supabase.rpc('update_elo_ratings', {
                'winner_id': winner_id,
                'loser_id': user_id
            }).execute()
        
        return jsonify({
            'status': 'success',
            'message': 'Match forfeited',
            'winner_id': winner_id
        })
        
    except Exception as e:
        raise APIError(f'Failed to forfeit match: {str(e)}', 500)