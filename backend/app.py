# app.py

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS  # Enable CORS for development; remember to configure or remove in production
from config.config import WEB_HOST_OF_APP, PORT_OF_MAP_FRONTEND
import logging
from flask_migrate import Migrate
from sqlalchemy.inspection import inspect
from env_variables import SUPABASE_DATABASE_PASSWORD, SUPABASE_APP_ID, SUPABASE_JWT_SECRET

# Initialize Flask-Migrate

ALLOWED_CORS_ORIGINS = [
    f"http://{WEB_HOST_OF_APP}:{PORT_OF_MAP_FRONTEND}",
]

app = Flask(__name__)
cors = CORS(app, resources={r"/*": 
    {"origins": ALLOWED_CORS_ORIGINS}},
            supports_credentials=True)  # For CORS, needed only in development

# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://postgres.{SUPABASE_APP_ID}:{SUPABASE_DATABASE_PASSWORD}@aws-0-ca-central-1.pooler.supabase.com:6543/postgres"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)


class BoatListing(db.Model):
    boat_listing_id = db.Column(db.Integer, primary_key=True)
    size = db.Column(db.String(50))
    name = db.Column(db.String(100))
    make_model = db.Column(db.String(100))
    notes = db.Column(db.Text)
    index = db.Column(db.Integer, unique=True)
    section = db.Column(db.String(1))
    mapped = db.Column(db.Boolean, default=False)
    customer_name = db.Column(db.String(100))
    vehicle_type = db.Column(db.String(50))
    boat_on_map_id = db.Column(db.Integer, nullable=True)

    def to_dict(self):
        return {column.key: getattr(self, column.key) for column in inspect(self).mapper.column_attrs}


class BoatOnMap(db.Model):
    # id = db.Column(db.Integer, primary_key=True)
    boat_on_map_id = db.Column(db.Integer, primary_key=True)
    x = db.Column(db.Float, nullable=False, default=200.0)
    y = db.Column(db.Float, nullable=False, default=200.0)
    width = db.Column(db.Float, nullable=False, default=100.0)
    height = db.Column(db.Float, nullable=False, default=50.0)
    color = db.Column(db.String(50), nullable=False, default='purple')
    angle = db.Column(db.Float, nullable=False, default=0)

    def to_dict(self):
        return {
            "boat_on_map_id": self.boat_on_map_id,  # Include reference field
            "x": self.x,
            "y": self.y,
            "width": self.width,
            "height": self.height,
            "color": self.color,
            "angle": self.angle
        }




# Create the database within the application context
with app.app_context():
    db.create_all()

# CRUD Operations

@app.route('/boat_listings', methods=['GET'])
def get_boat_listings():
    boat_listings = BoatListing.query.all()
    return jsonify({
        "boat_listings": [boat_listing.to_dict() for boat_listing in boat_listings],
    })

@app.route('/boat_listings', methods=['POST'])
def create_boat():
    data = request.json
    new_boat = BoatListing(
        size=data['size'],
        name=data['name'],
        make_model=data['make_model'],
        notes=data['notes'],
        index=data['index'],
        section=data['section'],
        mapped=False,  # Default to unmapped
        customer_name=data.get('customer_name'),  # Add new field
        vehicle_type=data.get('vehicle_type')  # Add new field
    )
    db.session.add(new_boat)
    db.session.commit()
    return jsonify(new_boat.to_dict()), 201

@app.route('/boat_listings/<int:boat_id>', methods=['PUT'])
def update_boat_listing(boat_id):
    data = request.json
    boat_listing = BoatListing.query.get_or_404(boat_id)
    boat_listing.size = data['size']
    boat_listing.name = data['name']
    boat_listing.make_model = data['make_model']
    boat_listing.notes = data['notes']
    boat_listing.index = data['index']
    boat_listing.section = data['section']
    boat_listing.customer_name = data.get('customer_name')  # Update new field
    boat_listing.vehicle_type = data.get('vehicle_type')  # Update new field
    boat_listing.boat_on_map_id = data.get('boat_on_map_id')
    print(f"Yes, we are getting here. Here's the boat listing: {boat_listing} Here's data's boat_on_map_id: {data['boat_on_map_id']}")
    db.session.commit()
    return jsonify(boat_listing.to_dict())

@app.route('/boat_listings/<int:boat_id>', methods=['DELETE'])
def delete_boat_listing(boat_id):
    boat = BoatListing.query.get_or_404(boat_id)
    db.session.delete(boat)
    db.session.commit()
    return jsonify({"message": "Boat lsting deleted successfully"})


@app.route('/boats-on-map', methods=['GET'])
def get_boats_on_map():
    boats_on_map = BoatOnMap.query.all()
    return jsonify({
        "boats_on_map": [boat_on_map.to_dict() for boat_on_map in boats_on_map],
    })

@app.route('/boats-on-map', methods=['POST'])
def create_boat_on_map():
    data = request.json
    new_boat_on_map = BoatOnMap(
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

@app.route('/boats-on-map/<int:id>', methods=['PUT'])
def update_boat_on_map(id):
    data = request.json
    boat_on_map = BoatOnMap.query.get_or_404(id)
    boat_on_map.x = data['x']
    boat_on_map.y = data['y']
    boat_on_map.width = data['width']
    boat_on_map.height = data['height']
    boat_on_map.color = data['color']
    boat_on_map.angle = data['angle']
    db.session.commit()
    return jsonify(boat_on_map.to_dict())

@app.route('/boats-on-map/<int:id>', methods=['DELETE'])
def delete_boat_on_map(id):
    boat_on_map = BoatOnMap.query.get_or_404(id)
    db.session.delete(boat_on_map)
    db.session.commit()
    return jsonify({"message": "BoatOnMap data deleted successfully"})


if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    app.run(debug=True)
