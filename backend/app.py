# app.py
from flask import Flask, request
from flask_cors import CORS
from config import Config
from utils.errors import APIError, handle_api_error
from matchmaker import Matchmaker

# Import blueprints
from routes.auth import auth_bp
from routes.queue import queue_bp
from routes.match import match_bp
from routes.execute import execute_bp
from routes.practice import practice_bp
from routes.hints import hints_bp

# Create Flask app
app = Flask(__name__)
app.config.from_object(Config)
app.url_map.strict_slashes = False

# ✅ FIXED CORS CONFIGURATION
CORS(app, 
     resources={
         r"/api/*": {
            "origins": ["http://localhost:5173"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization"],
             "expose_headers": ["Content-Type"],
             "supports_credentials": True,
             "max_age": 3600
         }
     })

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(queue_bp, url_prefix='/api/queue')
app.register_blueprint(match_bp, url_prefix='/api/match')
app.register_blueprint(execute_bp, url_prefix='/api/execute')
app.register_blueprint(practice_bp, url_prefix='/api/practice')
app.register_blueprint(hints_bp, url_prefix='/api/hint')

# Error handlers
app.register_error_handler(APIError, handle_api_error)

@app.route('/api/health', methods=['GET'])
def health():
    return {'status': 'healthy'}

# Handle OPTIONS requests explicitly (CORS preflight)
# @app.after_request
# def after_request(response):
#     origin = request.headers.get('Origin')
#     if origin in ['http://localhost:5173', 'http://127.0.0.1:5173']:
#         response.headers.add('Access-Control-Allow-Origin', origin)
#         response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
#         response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
#         response.headers.add('Access-Control-Allow-Credentials', 'true')
#     return response

# Initialize matchmaker
matchmaker = Matchmaker(interval=Config.MATCHMAKER_INTERVAL)

if __name__ == '__main__':
    matchmaker.start()
    try:
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=Config.FLASK_ENV == 'development'
        )
    finally:
        matchmaker.stop()