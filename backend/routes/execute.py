from flask import Blueprint, jsonify, request
from utils.validators import require_auth
from utils.errors import APIError
from judge0 import Judge0Client

execute_bp = Blueprint('execute', __name__)

@execute_bp.route('/', methods=['POST'])
@require_auth
def execute_code():
    """Execute code via Judge0"""
    data = request.get_json()
    
    if not data:
        raise APIError('No data provided', 400)
    
    source_code = data.get('source_code')
    language = data.get('language', 'python')
    stdin = data.get('stdin', '')
    expected_output = data.get('expected_output')
    
    if not source_code:
        raise APIError('source_code is required', 400)
    
    # Validate source_code is a string
    if not isinstance(source_code, str):
        raise APIError('source_code must be a string', 400)
    
    try:
        result = Judge0Client.execute(
            source_code=source_code,
            language=language,
            stdin=stdin,
            expected_output=expected_output
        )
        
        # Ensure all result fields are strings or numbers, not None
        safe_result = {
            'status': str(result.get('status') or 'Unknown'),
            'stdout': str(result.get('stdout') or ''),
            'stderr': str(result.get('stderr') or ''),
            'compile_output': str(result.get('compile_output') or ''),
            'message': str(result.get('message') or ''),
            'time': result.get('time') or 0,
            'memory': result.get('memory') or 0,
            'status_id': result.get('status_id') or 0
        }
        
        return jsonify({
            'status': 'success',
            'result': safe_result
        })
        
    except APIError as e:
        raise e
    except Exception as e:
        raise APIError(f'Execution failed: {str(e)}', 500)