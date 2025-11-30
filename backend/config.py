import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
    SUPABASE_JWT_SECRET = os.getenv('SUPABASE_JWT_SECRET', os.getenv('SUPABASE_SERVICE_KEY'))
    JUDGE0_API_KEY = os.getenv('JUDGE0_API_KEY')
    JUDGE0_HOST = os.getenv('JUDGE0_HOST', 'judge0-ce.p.rapidapi.com')
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')  # NEW: For Gemini AI hints
    FLASK_SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-in-prod')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    MATCHMAKER_INTERVAL = int(os.getenv('MATCHMAKER_INTERVAL', '10'))
    CASUAL_HINT_LIMIT = int(os.getenv('CASUAL_HINT_LIMIT', '3'))
    HINT_COOLDOWN_SECONDS = int(os.getenv('HINT_COOLDOWN_SECONDS', '10'))