import requests
import time
from config import Config
from utils.errors import APIError

class Judge0Client:
    BASE_URL = f"https://{Config.JUDGE0_HOST}/submissions"
    
    LANGUAGE_MAP = {
        'python': 71,  # Python 3
        'javascript': 63,  # JavaScript (Node.js)
        'cpp': 54,  # C++ (GCC 9.2.0)
        'java': 62,  # Java (OpenJDK 13.0.1)
    }
    
    @staticmethod
    def execute(source_code, language, stdin='', expected_output=None):
        """Execute code via Judge0 API"""
        language_id = Judge0Client.LANGUAGE_MAP.get(language.lower())
        if not language_id:
            raise APIError(f'Unsupported language: {language}', 400)
        
        headers = {
            'content-type': 'application/json',
            'X-RapidAPI-Key': Config.JUDGE0_API_KEY,
            'X-RapidAPI-Host': Config.JUDGE0_HOST
        }
        
        # Create submission
        payload = {
            'source_code': source_code,
            'language_id': language_id,
            'stdin': stdin or ''
        }
        
        # Add expected output if provided
        if expected_output:
            payload['expected_output'] = expected_output
        
        try:
            # Submit code (wait=false to get token)
            response = requests.post(
                f"{Judge0Client.BASE_URL}?base64_encoded=false&wait=false",
                json=payload,
                headers=headers,
                timeout=10
            )
            
            response.raise_for_status()
            submission_data = response.json()
            token = submission_data.get('token')
            
            if not token:
                raise APIError('No token received from Judge0', 500)
            
            # Poll for result (max 10 seconds)
            max_attempts = 20
            for attempt in range(max_attempts):
                time.sleep(0.5)
                
                result_response = requests.get(
                    f"{Judge0Client.BASE_URL}/{token}?base64_encoded=false",
                    headers=headers,
                    timeout=10
                )
                result_response.raise_for_status()
                result = result_response.json()
                
                status_id = result.get('status', {}).get('id')
                
                # Status IDs: 1=In Queue, 2=Processing, 3=Accepted, 4+=Error/Done
                if status_id and status_id > 2:
                    # Processing complete - safely get all fields with defaults
                    return {
                        'status': result.get('status', {}).get('description') or 'Unknown',
                        'stdout': result.get('stdout') or '',
                        'stderr': result.get('stderr') or '',
                        'compile_output': result.get('compile_output') or '',
                        'message': result.get('message') or '',
                        'time': result.get('time') or 0,
                        'memory': result.get('memory') or 0,
                        'status_id': status_id
                    }
            
            raise APIError('Execution timeout - code took too long', 408)
            
        except requests.Timeout:
            raise APIError('Judge0 request timeout', 408)
        except requests.RequestException as e:
            raise APIError(f'Judge0 API error: {str(e)}', 500)
        except Exception as e:
            raise APIError(f'Execution failed: {str(e)}', 500)