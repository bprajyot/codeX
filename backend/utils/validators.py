import jwt
from functools import wraps
from utils.errors import APIError
from config import Config
from functools import wraps
from flask import request, jsonify

def verify_token(token):
    """Verify Supabase JWT token"""
    try:
        # Get JWT secret from config
        jwt_secret = getattr(Config, 'SUPABASE_JWT_SECRET', Config.SUPABASE_KEY)
        
        # Supabase uses HS256 algorithm
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=['HS256'],
            audience='authenticated',
            options={
                'verify_signature': True,
                'verify_exp': True,
                'verify_aud': True
            }
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise APIError('Token has expired', 401)
    except jwt.InvalidTokenError as e:
        raise APIError(f'Invalid token: {str(e)}', 401)
    except Exception as e:
        raise APIError(f'Token verification failed: {str(e)}', 401)

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'No authorization header'}), 401
        
        try:
            token = auth_header.split(' ')[1] if ' ' in auth_header else auth_header
            
            # Decode JWT using Supabase secret
            payload = jwt.decode(
                token,
                Config.SUPABASE_JWT_SECRET,
                algorithms=['HS256'],
                options={"verify_aud": False}
            )
            
            request.user_id = payload.get('sub')
            
            if not request.user_id:
                return jsonify({'error': 'Invalid token: no user ID'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError as e:
            return jsonify({'error': f'Invalid token: {str(e)}'}), 401
        except Exception as e:
            return jsonify({'error': f'Auth error: {str(e)}'}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function

def validate_match_participant(match_id, user_id, supabase):
    """Validate user is participant in match"""
    from utils.errors import APIError
    
    result = supabase.table('matches')\
        .select('*')\
        .eq('id', match_id)\
        .single()\
        .execute()
    
    if not result.data:
        raise APIError('Match not found', 404)
    
    match = result.data
    
    if match['player1_id'] != user_id and match['player2_id'] != user_id:
        raise APIError('Not a participant in this match', 403)
    
    return match