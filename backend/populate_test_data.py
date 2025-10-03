# backend/populate_test_data.py
from app import app, db, BoatListing, BoatOnMap
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
    
    for i in range(30):
        # Create boat on map
        boat_map = BoatOnMap(
            boat_on_map_id=i+1,
            x=random.randint(100, 700),
            y=random.randint(100, 1000),
            width=random.randint(80, 150),
            height=random.randint(40, 80),
            color=random.choice(['blue', 'red', 'green', 'yellow', 'purple', 'orange']),
            angle=random.randint(0, 360)
        )
        db.session.add(boat_map)
        
        # Create boat listing
        boat = BoatListing(
            size=str(random.randint(20, 45)),
            name=boat_names[i],
            make_model=f"{random.choice(makes)} {random.randint(200, 400)}",
            notes=f"Test boat #{i+1}",
            index=i+1,
            section=random.choice(['A', 'B', 'C', 'D', 'E', 'F']),
            customer_name=customer_names[i],
            vehicle_type=random.choice(['Boat', 'Yacht', 'Speedboat', 'Fishing Boat']),
            boat_on_map_id=i+1
        )
        db.session.add(boat)
    
    db.session.commit()
    print("✓ Created 30 boats with map positions")