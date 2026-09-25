import os
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from sqlalchemy import create_engine
from .models import db
from .routes import auth_bp, complaints_bp, emergencies_bp, admin_bp, staff_bp, notifications_bp
from .utils.seed_data import seed_database
from config import Config

jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure uploads directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Enable CORS for all frontend interactions
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Database connectivity verification & seamless fallback
    db_uri = app.config.get('SQLALCHEMY_DATABASE_URI', '')
    if db_uri.startswith('mysql'):
        try:
            test_engine = create_engine(db_uri, pool_pre_ping=True, connect_args={"connect_timeout": 3})
            with test_engine.connect() as conn:
                pass
            test_engine.dispose()
            print("[ResQHub] Successfully connected to MySQL database.")
        except Exception as e:
            print(f"[ResQHub Notice] MySQL not connected with provided credentials ({e.args[0] if e.args else e}).")
            print("[ResQHub] Activated high-performance SQLite engine (resqhub.db) for instant zero-config operation.")
            sqlite_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'resqhub.db')
            app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{sqlite_path}"

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(complaints_bp)
    app.register_blueprint(emergencies_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(staff_bp)
    app.register_blueprint(notifications_bp)

    # Serve uploaded images statically
    @app.route('/api/uploads/<path:filename>', methods=['GET'])
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        db_type = 'sqlite' if 'sqlite' in app.config['SQLALCHEMY_DATABASE_URI'] else 'mysql'
        return jsonify({
            'status': 'healthy',
            'service': 'ResQHub API',
            'database': db_type
        }), 200

    # Auto-initialize database tables and seed demo data
    with app.app_context():
        try:
            db.create_all()
            seed_database()
        except Exception as err:
            print(f"[ResQHub DB Init Error]: {err}")

    return app
