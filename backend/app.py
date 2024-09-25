from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Boat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    size = db.Column(db.String(50))
    name = db.Column(db.String(100))
    make_model = db.Column(db.String(100))
    notes = db.Column(db.Text)
    index = db.Column(db.Integer, unique=True)
    section = db.Column(db.String(1))
    mapped = db.Column(db.Boolean, default=False)

# Create the database within the application context
with app.app_context():
    db.create_all()

# CRUD Operations

@app.route('/boats', methods=['GET'])
def get_boats():
    page = request.args.get('page', 1, type=int)
    per_page = 10
    boats = Boat.query.paginate(page=page, per_page=per_page)
    return jsonify({
        "boats": [boat_to_dict(boat) for boat in boats.items],
        "total": boats.total,
        "pages": boats.pages,
        "current_page": boats.page
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
        mapped=False  # Default to unmapped
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
    db.session.commit()
    return jsonify(boat_to_dict(boat))

@app.route('/boats/<int:boat_id>', methods=['DELETE'])
def delete_boat(boat_id):
    boat = Boat.query.get_or_404(boat_id)
    db.session.delete(boat)
    db.session.commit()
    return jsonify({"message": "Boat deleted successfully"})

def boat_to_dict(boat):
    return {
        "id": boat.id,
        "size": boat.size,
        "name": boat.name,
        "make_model": boat.make_model,
        "notes": boat.notes,
        "index": boat.index,
        "section": boat.section,
        "mapped": boat.mapped
    }

if __name__ == "__main__":
    app.run(debug=True)
