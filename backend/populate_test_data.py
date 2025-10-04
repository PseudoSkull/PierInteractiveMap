# backend/populate_test_data.py
from app import app, db, BoatListing, BoatOnMap, Version
from datetime import datetime
import random

boat_names = [
    "Sea Breeze", "Wave Runner", "Aqua Dream", "Ocean Star", "Blue Horizon",
    "Sunset Sailor", "Marina's Pride", "Harbor Master", "Tide Turner", "Wind Chaser",
    "Deep Blue", "Coral Reef", "Salt Life", "Anchor Down", "High Tide",
    "Smooth Sailing", "Captain's Choice", "Bay Wanderer", "Nautical Nights", "Shore Thing",
    "Drift Away", "Sea Spray", "Island Hopper", "Coast Guard", "Pier Pressure",
    "Reel Time", "Knot Working", "Seas the Day", "Bow Movement", "Shell Seeker"
]

makes = ["Sea Ray", "Boston Whaler", "Bayliner", "Grady-White", "Chris-Craft", 
         "Chaparral", "Cobalt", "Wellcraft", "Formula", "Rinker"]

customer_names = [
    "John Smith", "Mary Johnson", "Robert Williams", "Patricia Brown", "Michael Jones",
    "Linda Garcia", "William Miller", "Elizabeth Davis", "David Rodriguez", "Jennifer Martinez",
    "Richard Hernandez", "Maria Lopez", "Joseph Gonzalez", "Susan Wilson", "Thomas Anderson",
    "Margaret Taylor", "Charles Thomas", "Jessica Moore", "Christopher Jackson", "Sarah White",
    "Daniel Harris", "Karen Martin", "Matthew Thompson", "Nancy Garcia", "Anthony Martinez",
    "Lisa Robinson", "Mark Clark", "Betty Rodriguez", "Donald Lewis", "Sandra Lee"
]

with app.app_context():
    db.create_all()
    
    # Clear existing data
    BoatListing.query.delete()
    BoatOnMap.query.delete()
    Version.query.delete()
    
    # Create initial WORKING COPY (not a saved version yet)
    initial_working_copy = Version(
        created_at=datetime.utcnow(),
        note="",
        is_current=False,
        is_working_copy=True
    )
    db.session.add(initial_working_copy)
    db.session.flush()
    
    # Create map positions first and store their IDs
    map_positions = []
    for i in range(30):
        boat_map = BoatOnMap(
            boat_on_map_id=i+1,  # Reference number
            version_id=initial_working_copy.version_id,
            x=random.randint(100, 700),
            y=random.randint(100, 1000),
            width=random.randint(80, 150),
            height=random.randint(40, 80),
            color=random.choice(['blue', 'red', 'green', 'yellow', 'purple', 'orange']),
            angle=random.randint(0, 360)
        )
        db.session.add(boat_map)
        db.session.flush()  # Get the auto-generated ID
        map_positions.append(boat_map)
    
    # Now create boat listings with proper foreign key references
    for i in range(30):
        boat = BoatListing(
            version_id=initial_working_copy.version_id,
            size=str(random.randint(20, 45)),
            name=boat_names[i],
            make_model=f"{random.choice(makes)} {random.randint(200, 400)}",
            notes=f"Test boat #{i+1}",
            index=i+1,
            section=random.choice(['A', 'B', 'C', 'D', 'E', 'F']),
            customer_name=customer_names[i],
            vehicle_type=random.choice(['Boat', 'Yacht', 'Speedboat', 'Fishing Boat']),
            map_position_id=map_positions[i].id  # Use the actual database ID
        )
        db.session.add(boat)
    
    db.session.commit()
    print(f"✓ Created initial working copy (ID: {initial_working_copy.version_id})")
    print("✓ Created 30 boats with map positions")
    print("Note: This is a WORKING COPY. Click 'Save Version' to create your first saved version.")