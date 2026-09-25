import os
from datetime import timedelta
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'resqhub-super-secret-key-change-in-prod')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'resqhub-jwt-secret-key-dev')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    # Database configuration
    # Default MySQL connection string; if unavailable or SQLite requested, fallback to SQLite
    DEFAULT_MYSQL = "mysql+pymysql://root:password@localhost:3306/resqhub_db"
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or os.environ.get('MYSQL_URL') or DEFAULT_MYSQL
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # File uploads
    UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB maximum
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
