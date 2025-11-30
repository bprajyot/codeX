from flask import jsonify

class APIError(Exception):
    def __init__(self, message, status_code=400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

def handle_api_error(error):
    response = {
        'error': error.message,
        'status': 'error'
    }
    return jsonify(response), error.status_code