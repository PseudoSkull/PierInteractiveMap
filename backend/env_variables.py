import os

from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env

SUPABASE_DATABASE_PASSWORD = os.getenv('SUPABASE_DATABASE_PASSWORD')
SUPABASE_APP_ID = os.getenv('SUPABASE_APP_ID')
SUPABASE_JWT_SECRET = os.getenv('SUPABASE_JWT_SECRET')

WEB_HOST_OF_APP = os.getenv('WEB_HOST_OF_APP')
PORT_OF_MAP_FRONTEND = os.getenv('PORT_OF_MAP_FRONTEND')