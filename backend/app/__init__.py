import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__, static_folder='uploads', static_url_path='/uploads')
    app.config.from_object('app.config.Config')

    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    # CORS — allow localhost in dev, and any *.onrender.com domain in production
    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:5173",
    ]
    # Also allow all onrender.com subdomains for the deployed frontend
    render_frontend = os.environ.get('FRONTEND_URL')
    if render_frontend:
        allowed_origins.append(render_frontend)

    CORS(app, resources={r"/api/*": {"origins": allowed_origins + ["https://*.onrender.com"]}}, supports_credentials=True)


    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.properties import properties_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/admin')
    app.register_blueprint(properties_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Serve React frontend for non-API routes (production)
    from flask import send_from_directory
    
    # Check parent folder (local development)
    frontend_folder = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '..', 'frontend', 'dist'))
    
    # If not found (Render deployment), check dist inside backend folder
    if not os.path.exists(frontend_folder):
        frontend_folder = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dist'))

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path.startswith('api/') or path.startswith('uploads/'):
            from flask import abort
            abort(404)
        if path and os.path.exists(os.path.join(frontend_folder, path)):
            return send_from_directory(frontend_folder, path)
        index_path = os.path.join(frontend_folder, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(frontend_folder, 'index.html')
        return {'message': 'API is running. Frontend not built yet.', 'folder_path': frontend_folder}, 200

    return app
