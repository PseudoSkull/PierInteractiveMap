# app.py

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS  # Enable CORS for development; remember to configure or remove in production
from config.config import WEB_HOST_OF_APP, PORT_OF_MAP_FRONTEND
import logging

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

# Updated Boat model to include new fields
class Boat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    size = db.Column(db.String(50))
    name = db.Column(db.String(100))
    make_model = db.Column(db.String(100))
    notes = db.Column(db.Text)
    index = db.Column(db.Integer, unique=True)
    section = db.Column(db.String(1))
    mapped = db.Column(db.Boolean, default=False)
    customer_name = db.Column(db.String(100))  # New field
    vehicle_type = db.Column(db.String(50))  # New field

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

if __name__ == "__main__":
    # Set the logging level
    logging.basicConfig(level=logging.DEBUG)
    app.run(debug=True)
