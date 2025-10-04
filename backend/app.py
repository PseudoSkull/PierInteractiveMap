# app.py

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import logging
from flask_migrate import Migrate
from sqlalchemy.inspection import inspect
from env_variables import SUPABASE_JWT_SECRET, WEB_HOST_OF_APP, PORT_OF_MAP_FRONTEND
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
import os
from datetime import datetime
import json

if PORT_OF_MAP_FRONTEND != "":
    colon = ":"
else:
    colon = ""

ALLOWED_CORS_ORIGINS = [
    f"http://{WEB_HOST_OF_APP}/",
]

app = Flask(__name__)

# Load config based on environment
env = os.getenv('FLASK_ENV', 'production')
if env == 'testing':
    app.config.from_object('config.TestConfig')
else:
    app.config.from_object('config.ProductionConfig')

# Allow different origins based on environment
if env == 'testing':
    CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)
else:
    CORS(app, resources={r"/*": {"origins": "https://pier-frontend-image-repo-86835021491.us-central1.run.app"}}, supports_credentials=True)

@app.after_request
def apply_cors(response):
    response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

db = SQLAlchemy(app)
migrate = Migrate(app, db)

def validate_jwt(token):
    try:
        decoded = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        return decoded
    except ExpiredSignatureError:
        print("Expired token")
        return None
    except InvalidTokenError:
        return "Invalid token"

def authenticate_request():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Authorization header missing or malformed'}), 401
    token = auth_header.split(' ')[1]
    decoded_session = validate_jwt(token)
    if decoded_session == "Invalid token":
        return jsonify({'error': 'Invalid JWT'}), 401
    elif decoded_session == "Expired token":
        return jsonify({'error': 'Expired JWT'}), 401
    if not decoded_session:
        return jsonify({'error': 'An unknown auth error occurred'}), 401
    return True

class Version(db.Model):
    version_id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    saved_at = db.Column(db.DateTime, nullable=True)
    note = db.Column(db.String(200))
    is_current = db.Column(db.Boolean, default=False)
    is_working_copy = db.Column(db.Boolean, default=False)
    
    boat_listings = db.relationship('BoatListing', backref='version', lazy=True, cascade='all, delete-orphan')
    boats_on_map = db.relationship('BoatOnMap', backref='version', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            "version_id": self.version_id,
            "created_at": self.created_at.isoformat(),
            "saved_at": self.saved_at.isoformat() if self.saved_at else None,
            "note": self.note,
            "is_current": self.is_current
        }

class BoatOnMap(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    boat_on_map_id = db.Column(db.Integer, nullable=False)
    version_id = db.Column(db.Integer, db.ForeignKey('version.version_id'), nullable=False)
    x = db.Column(db.Float, nullable=False, default=200.0)
    y = db.Column(db.Float, nullable=False, default=200.0)
    width = db.Column(db.Float, nullable=False, default=100.0)
    height = db.Column(db.Float, nullable=False, default=50.0)
    color = db.Column(db.String(50), nullable=False, default='purple')
    angle = db.Column(db.Float, nullable=False, default=0)
    
    boat_listing = db.relationship('BoatListing', backref='map_position', uselist=False)

    def to_dict(self):
        return {
            "id": self.id,
            "boat_on_map_id": self.boat_on_map_id,
            "version_id": self.version_id,
            "x": self.x,
            "y": self.y,
            "width": self.width,
            "height": self.height,
            "color": self.color,
            "angle": self.angle
        }

class BoatListing(db.Model):
    boat_listing_id = db.Column(db.Integer, primary_key=True)
    version_id = db.Column(db.Integer, db.ForeignKey('version.version_id'), nullable=False)
    size = db.Column(db.String(50))
    name = db.Column(db.String(100))
    make_model = db.Column(db.String(100))
    notes = db.Column(db.Text)
    index = db.Column(db.Integer)
    section = db.Column(db.String(1))
    customer_name = db.Column(db.String(100))
    vehicle_type = db.Column(db.String(50))
    map_position_id = db.Column(db.Integer, db.ForeignKey('boat_on_map.id'), nullable=True)

    def to_dict(self):
        return {column.key: getattr(self, column.key) for column in inspect(self).mapper.column_attrs}

with app.app_context():
    db.create_all()

# Version endpoints
@app.route('/versions', methods=['GET'])
def get_versions():
    auth_result = authenticate_request()
    if auth_result is not True:
        return auth_result
    
    page = request.args.get('page', 1, type=int)
    per_page = 10
    
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    search_note = request.args.get('search_note')
    
    query = Version.query.filter_by(is_working_copy=False)
    
    if start_date:
        query = query.filter(Version.saved_at >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Version.saved_at <= datetime.fromisoformat(end_date))
    if search_note:
        query = query.filter(Version.note.ilike(f'%{search_note}%'))
    
    query = query.order_by(Version.saved_at.desc())
    
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        "versions": [v.to_dict() for v in paginated.items],
        "total": paginated.total,
        "pages": paginated.pages,
        "current_page": page
    })

@app.route('/versions/current', methods=['GET'])
def get_current_version():
    auth_result = authenticate_request()
    if auth_result is not True:
        return auth_result
    
    current = Version.query.filter_by(is_current=True, is_working_copy=False).first()
    if not current:
        return jsonify({"error": "No current version"}), 404
    return jsonify(current.to_dict())

@app.route('/versions', methods=['POST'])
def create_version():
    auth_result = authenticate_request()
    if auth_result is not True:
        return auth_result
    
    data = request.json
    working_copy = Version.query.filter_by(is_working_copy=True).first()
    
    if not working_copy:
        return jsonify({"error": "No working copy exists"}), 400
    
    Version.query.update({Version.is_current: False})
    db.session.flush()
    
    working_copy.is_working_copy = False
    working_copy.is_current = True
    working_copy.note = data.get('note', '')
    working_copy.saved_at = datetime.utcnow()
    db.session.flush()
    
    new_working_copy = Version(
        created_at=datetime.utcnow(),
        saved_at=None,
        note="",
        is_current=False,
        is_working_copy=True
    )
    db.session.add(new_working_copy)
    db.session.flush()
    
    old_to_new_map = {}
    
    saved_maps = BoatOnMap.query.filter_by(version_id=working_copy.version_id).all()
    for boat_map in saved_maps:
        new_map = BoatOnMap(
            version_id=new_working_copy.version_id,
            boat_on_map_id=boat_map.boat_on_map_id,
            x=boat_map.x,
            y=boat_map.y,
            width=boat_map.width,
            height=boat_map.height,
            color=boat_map.color,
            angle=boat_map.angle
        )
        db.session.add(new_map)
        db.session.flush()
        old_to_new_map[boat_map.id] = new_map.id
    
    saved_boats = BoatListing.query.filter_by(version_id=working_copy.version_id).all()
    for boat in saved_boats:
        new_boat = BoatListing(
            version_id=new_working_copy.version_id,
            size=boat.size,
            name=boat.name,
            make_model=boat.make_model,
            notes=boat.notes,
            index=boat.index,
            section=boat.section,
            customer_name=boat.customer_name,
            vehicle_type=boat.vehicle_type,
            map_position_id=old_to_new_map.get(boat.map_position_id) if boat.map_position_id else None
        )
        db.session.add(new_boat)
    
    db.session.commit()
    return jsonify(working_copy.to_dict()), 201

@app.route('/versions/<int:version_id>/restore', methods=['POST'])
def restore_version(version_id):
    auth_result = authenticate_request()
    if auth_result is not True:
        return auth_result
    
    version_to_restore = Version.query.get_or_404(version_id)
    
    working_copy = Version.query.filter_by(is_working_copy=True).first()
    if working_copy:
        db.session.delete(working_copy)
    
    new_working_copy = Version(
        created_at=datetime.utcnow(),
        note="",
        is_current=False,
        is_working_copy=True
    )
    db.session.add(new_working_copy)
    db.session.flush()
    
    old_to_new_map = {}
    
    restored_maps = BoatOnMap.query.filter_by(version_id=version_to_restore.version_id).all()
    for boat_map in restored_maps:
        new_map = BoatOnMap(
            version_id=new_working_copy.version_id,
            boat_on_map_id=boat_map.boat_on_map_id,
            x=boat_map.x,
            y=boat_map.y,
            width=boat_map.width,
            height=boat_map.height,
            color=boat_map.color,
            angle=boat_map.angle
        )
        db.session.add(new_map)
        db.session.flush()
        old_to_new_map[boat_map.id] = new_map.id
    
    restored_boats = BoatListing.query.filter_by(version_id=version_to_restore.version_id).all()
    for boat in restored_boats:
        new_boat = BoatListing(
            version_id=new_working_copy.version_id,
            size=boat.size,
            name=boat.name,
            make_model=boat.make_model,
            notes=boat.notes,
            index=boat.index,
            section=boat.section,
            customer_name=boat.customer_name,
            vehicle_type=boat.vehicle_type,
            map_position_id=old_to_new_map.get(boat.map_position_id) if boat.map_position_id else None
        )
        db.session.add(new_boat)
    
    db.session.commit()
    return jsonify({"message": "Version restored to working copy"})

@app.route('/versions/<int:version_id>/note', methods=['PUT'])
def update_version_note(version_id):
    auth_result = authenticate_request()
    if auth_result is not True:
        return auth_result
    
    data = request.json
    version = Version.query.get_or_404(version_id)
    version.note = data.get('note', '')[:200]
    db.session.commit()
    return jsonify(version.to_dict())

@app.route('/versions/<int:version_id>/data', methods=['GET'])
def get_version_data(version_id):
    auth_result = authenticate_request()
    if auth_result is not True:
        return auth_result
    
    boats = BoatListing.query.filter_by(version_id=version_id).all()
    maps = BoatOnMap.query.filter_by(version_id=version_id).all()
    
    return jsonify({
        "boat_listings": [b.to_dict() for b in boats],
        "boats_on_map": [m.to_dict() for m in maps]
    })

# Boat listing endpoints
@app.route('/boat_listings', methods=['GET'])
def get_boat_listings():
    auth_result = authenticate_request()
    if auth_result is not True:
        return auth_result
    
    working_copy = Version.query.filter_by(is_working_copy=True).first()
    if not working_copy:
        return jsonify({"boat_listings": []})
    
    boat_listings = BoatListing.query.filter_by(version_id=working_copy.version_id).all()
    return jsonify({
        "boat_listings": [boat_listing.to_dict() for boat_listing in boat_listings],
    })

@app.route('/boat_listings', methods=['POST'])
def create_boat():
    auth_result = authenticate_request()
    if auth_result is not True:
        return auth_result
    
    working_copy = Version.query.filter_by(is_working_copy=True).first()
    if not working_copy:
        return jsonify({"error": "No working copy exists"}), 400
    
    data = request.json
    new_boat = BoatListing(
        version_id=working_copy.version_id,
        size=data['size'],
        name=data['name'],
        make_model=data['make_model'],
        notes=data['notes'],
        index=data['index'],
        section=data['section'],
        customer_name=data.get('customer_name'),
        vehicle_type=data.get('vehicle_type'),
        map_position_id=data.get('map_position_id')
    )
    db.session.add(new_boat)
    db.session.commit()
    return jsonify(new_boat.to_dict()), 201

@app.route('/boat_listings/<int:boat_id>', methods=['PUT'])
def update_boat_listing(boat_id):
    auth_result = authenticate_request()
    if auth_result is not True:
        return auth_result
    
    data = request.json
    boat_listing = BoatListing.query.get_or_404(boat_id)
    boat_listing.size = data['size']
    boat_listing.name = data['name']
    boat_listing.make_model = data['make_model']
    boat_listing.notes = data['notes']
    boat_listing.index = data['index']
    boat_listing.section = data['section']
    boat_listing.customer_name = data.get('customer_name')
    boat_listing.vehicle_type = data.get('vehicle_type')
    boat_listing.map_position_id = data.get('map_position_id')
    db.session.commit()
    return jsonify(boat_listing.to_dict())

@app.route('/boat_listings/<int:boat_id>', methods=['DELETE'])
def delete_boat_listing(boat_id):
    auth_result = authenticate_request()
    if auth_result is not True:
        return auth_result
    
    boat = BoatListing.query.get_or_404(boat_id)
    db.session.delete(boat)
    db.session.commit()
    return jsonify({"message": "Boat listing deleted successfully"})

@app.route('/boats-on-map', methods=['GET'])
def get_boats_on_map():
    auth_result = authenticate_request()
    if auth_result is not True:
        return auth_result
    
    working_copy = Version.query.filter_by(is_working_copy=True).first()
    if not working_copy:
        return jsonify({"boats_on_map": []})
    
    boats_on_map = BoatOnMap.query.filter_by(version_id=working_copy.version_id).all()
    return jsonify({
        "boats_on_map": [boat_on_map.to_dict() for boat_on_map in boats_on_map],
    })

@app.route('/boats-on-map', methods=['POST'])
def create_boat_on_map():
    auth_result = authenticate_request()
    if auth_result is not True:
        return auth_result
    
    working_copy = Version.query.filter_by(is_working_copy=True).first()
    if not working_copy:
        return jsonify({"error": "No working copy exists"}), 400
    
    data = request.json
    new_boat_on_map = BoatOnMap(
        version_id=working_copy.version_id,
        boat_on_map_id=data.get('boat_on_map_id'),
        x=data['x'],
        y=data['y'],
        width=data['width'],
        height=data['height'],
        color=data['color'],
        angle=data['angle']
    )
    db.session.add(new_boat_on_map)
    db.session.commit()
    return jsonify(new_boat_on_map.to_dict()), 201

@app.route('/boats-on-map/<int:boat_on_map_id>', methods=['PUT'])
def update_boat_on_map(boat_on_map_id):
    auth_result = authenticate_request()
    if auth_result is not True:
        return auth_result
    
    data = request.json
    working_copy = Version.query.filter_by(is_working_copy=True).first()
    
    boat_on_map = BoatOnMap.query.filter_by(
        boat_on_map_id=boat_on_map_id,
        version_id=working_copy.version_id
    ).first_or_404()
    
    boat_on_map.x = data['x']
    boat_on_map.y = data['y']
    boat_on_map.width = data['width']
    boat_on_map.height = data['height']
    boat_on_map.color = data['color']
    boat_on_map.angle = data['angle']
    db.session.commit()
    return jsonify(boat_on_map.to_dict())

@app.route('/boats-on-map/<int:boat_on_map_id>', methods=['DELETE'])
def delete_boat_on_map(boat_on_map_id):
    auth_result = authenticate_request()
    if auth_result is not True:
        return auth_result
    
    working_copy = Version.query.filter_by(is_working_copy=True).first()
    
    boat_on_map = BoatOnMap.query.filter_by(
        boat_on_map_id=boat_on_map_id,
        version_id=working_copy.version_id
    ).first_or_404()
    
    db.session.delete(boat_on_map)
    db.session.commit()
    return jsonify({"message": "BoatOnMap data deleted successfully"})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)