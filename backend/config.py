import os
from env_variables import SUPABASE_DATABASE_PASSWORD, SUPABASE_APP_ID

class Config:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
class ProductionConfig(Config):
    # Your existing Supabase connection
    SQLALCHEMY_DATABASE_URI = f"postgresql://postgres.{SUPABASE_APP_ID}:{SUPABASE_DATABASE_PASSWORD}@aws-0-ca-central-1.pooler.supabase.com:6543/postgres"
    DEBUG = False
    
class TestConfig(Config):
    # Local SQLite for testing
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test_database.db'
    DEBUG = True
    TESTING = True