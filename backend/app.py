# app.py

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS  # Enable CORS for development; remember to configure or remove in production
from config.config import WEB_HOST_OF_APP, PORT_OF_MAP_FRONTEND
import logging
from flask_migrate import Migrate

# Initialize Flask-Migrate


ALLOWED_CORS_ORIGINS = [
    f"http://{WEB_HOST_OF_APP}:{PORT_OF_MAP_FRONTEND}",
]

app = Flask(__name__)
cors = CORS(app, resources={r"/*": 
    {"origins": ALLOWED_CORS_ORIGINS}},
            supports_credentials=True)  # For CORS, needed only in development

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)


class Boat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    size = db.Column(db.String(50))
    name = db.Column(db.String(100))
    make_model = db.Column(db.String(100))
    notes = db.Column(db.Text)
    index = db.Column(db.Integer, unique=True)
    section = db.Column(db.String(1))
    mapped = db.Column(db.Boolean, default=False)
    customer_name = db.Column(db.String(100))
    vehicle_type = db.Column(db.String(50))
    boat_on_map_id = db.Column(db.Integer, nullable=True)  # Informational reference

    def to_dict(self):
        return {
            "id": self.id,
            "size": self.size,
            "name": self.name,
            "make_model": self.make_model,
            "notes": self.notes,
            "index": self.index,
            "section": self.section,
            "mapped": self.mapped,
            "customer_name": self.customer_name,
            "vehicle_type": self.vehicle_type,
            "boat_on_map_id": self.boat_on_map_id  # Include reference field
        }


class BoatOnMap(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    boat_id = db.Column(db.Integer, nullable=True)  # Informational reference
    x = db.Column(db.Float, nullable=False, default=200.0)
    y = db.Column(db.Float, nullable=False, default=200.0)
    width = db.Column(db.Float, nullable=False, default=100.0)
    height = db.Column(db.Float, nullable=False, default=50.0)
    color = db.Column(db.String(50), nullable=False, default='purple')
    angle = db.Column(db.Float, nullable=False, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "boat_id": self.boat_id,  # Include reference field
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

@app.route('/boats', methods=['GET'])
def get_boats():
    boats = Boat.query.all()
    return jsonify({
        "boats": [boat_to_dict(boat) for boat in boats],
    })

@app.route('/boats', methods=['POST'])
def create_boat():
    data = request.json
    new_boat = Boat(
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
    return jsonify(boat_to_dict(new_boat)), 201

@app.route('/boats/<int:boat_id>', methods=['PUT'])
def update_boat(boat_id):
    data = request.json
    boat = Boat.query.get_or_404(boat_id)
    boat.size = data['size']
    boat.name = data['name']
    boat.make_model = data['make_model']
    boat.notes = data['notes']
    boat.index = data['index']
    boat.section = data['section']
    boat.customer_name = data.get('customer_name')  # Update new field
    boat.vehicle_type = data.get('vehicle_type')  # Update new field
    db.session.commit()
    return jsonify(boat_to_dict(boat))

@app.route('/boats/<int:boat_id>', methods=['DELETE'])
def delete_boat(boat_id):
    boat = Boat.query.get_or_404(boat_id)
    db.session.delete(boat)
    db.session.commit()
    return jsonify({"message": "Boat deleted successfully"})

# Update the boat_to_dict function to include the new fields
def boat_to_dict(boat):
    return {
        "id": boat.id,
        "size": boat.size,
        "name": boat.name,
        "make_model": boat.make_model,
        "notes": boat.notes,
        "index": boat.index,
        "section": boat.section,
        "mapped": boat.mapped,
        "customer_name": boat.customer_name,  # Include new field
        "vehicle_type": boat.vehicle_type  # Include new field
    }

@app.route('/boats-on-map', methods=['GET'])
def get_boats_on_map():
    boats_on_map = BoatOnMap.query.all()
    return jsonify({
        "boats_on_map": [boat_on_map_to_dict(bom) for bom in boats_on_map],
    })

@app.route('/boats-on-map', methods=['POST'])
def create_boat_on_map():
    data = request.json
    new_boat_on_map = BoatOnMap(
        boat_id=data.get('boat_id'),
        x=data['x'],
        y=data['y'],
        width=data['width'],
        height=data['height'],
        color=data['color'],
        angle=data['angle']
    )
    db.session.add(new_boat_on_map)
    db.session.commit()
    return jsonify(boat_on_map_to_dict(new_boat_on_map)), 201

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
    return jsonify(boat_on_map_to_dict(boat_on_map))

@app.route('/boats-on-map/<int:id>', methods=['DELETE'])
def delete_boat_on_map(id):
    boat_on_map = BoatOnMap.query.get_or_404(id)
    db.session.delete(boat_on_map)
    db.session.commit()
    return jsonify({"message": "BoatOnMap data deleted successfully"})

def boat_on_map_to_dict(bom):
    return {
        "id": bom.id,
        "boat_id": bom.boat_id,
        "x": bom.x,
        "y": bom.y,
        "width": bom.width,
        "height": bom.height,
        "color": bom.color,
        "angle": bom.angle,
    }


if __name__ == "__main__":
    # Set the logging level
    logging.basicConfig(level=logging.DEBUG)
    app.run(debug=True)
