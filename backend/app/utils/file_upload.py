import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

def allowed_file(filename):
    if '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in current_app.config['ALLOWED_EXTENSIONS']

def save_uploaded_file(file_storage):
    """Saves uploaded file securely and returns relative URL path"""
    if not file_storage or file_storage.filename == '':
        return None
    
    if not allowed_file(file_storage.filename):
        raise ValueError("Invalid file format. Only JPG, JPEG, PNG, and WEBP files are allowed.")
    
    upload_folder = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)
    
    original_name = secure_filename(file_storage.filename)
    extension = original_name.rsplit('.', 1)[1].lower() if '.' in original_name else 'jpg'
    unique_name = f"{uuid.uuid4().hex[:12]}_{int(uuid.uuid1().time)}_{original_name}"
    
    filepath = os.path.join(upload_folder, unique_name)
    file_storage.save(filepath)
    
    # Return API endpoint path to serve file
    return f"/api/uploads/{unique_name}"
