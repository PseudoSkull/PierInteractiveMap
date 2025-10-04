# backend/migrate_to_versions.py

"""
Migration script to convert existing boat data to versioned schema.

This script:
1. Creates an initial version
2. Migrates all existing boats and map positions to that version
3. Marks it as the current version

Run this ONCE after deploying the new schema.
"""

from app import app, db, Version, BoatListing, BoatOnMap
from datetime import datetime
from sqlalchemy import text

def migrate_data():
    with app.app_context():
        print("Starting migration...")
        
        # Check if we already have versions
        existing_versions = Version.query.count()
        if existing_versions > 0:
            print(f"Warning: {existing_versions} versions already exist.")
            response = input("Continue anyway? This will create a new initial version. (y/n): ")
            if response.lower() != 'y':
                print("Migration cancelled.")
                return
        
        # Get all existing boats (they won't have version_id yet)
        # This assumes your old schema didn't have version_id
        try:
            # Try to get boats without version filtering
            old_boats = db.session.execute(
                text("SELECT * FROM boat_listing WHERE version_id IS NULL")
            ).fetchall()
            
            old_maps = db.session.execute(
                text("SELECT * FROM boat_on_map WHERE version_id IS NULL")
            ).fetchall()
            
            print(f"Found {len(old_boats)} boat listings without versions")
            print(f"Found {len(old_maps)} map positions without versions")
            
            if len(old_boats) == 0 and len(old_maps) == 0:
                print("No data to migrate. Exiting.")
                return
            
            # Create initial version
            initial_version = Version(
                created_at=datetime.utcnow(),
                note="Initial version (migrated from pre-version data)",
                is_current=True
            )
            db.session.add(initial_version)
            db.session.flush()
            
            print(f"Created initial version with ID: {initial_version.version_id}")
            
            # Update all boats to use this version
            if old_boats:
                db.session.execute(
                    text("UPDATE boat_listing SET version_id = :version_id WHERE version_id IS NULL"),
                    {"version_id": initial_version.version_id}
                )
                print(f"Updated {len(old_boats)} boat listings to version {initial_version.version_id}")
            
            # Update all map positions to use this version
            if old_maps:
                db.session.execute(
                    text("UPDATE boat_on_map SET version_id = :version_id WHERE version_id IS NULL"),
                    {"version_id": initial_version.version_id}
                )
                print(f"Updated {len(old_maps)} map positions to version {initial_version.version_id}")
            
            db.session.commit()
            print("Migration completed successfully!")
            print(f"All data is now in version {initial_version.version_id}")
            
        except Exception as e:
            print(f"Error during migration: {e}")
            db.session.rollback()
            print("Migration rolled back.")
            raise

if __name__ == "__main__":
    print("=" * 60)
    print("BOAT DATA VERSION MIGRATION")
    print("=" * 60)
    print("\nThis will migrate your existing boat data to the new versioned schema.")
    print("Make sure you have a backup before proceeding!")
    print("\nPress Ctrl+C to cancel, or Enter to continue...")
    input()
    
    migrate_data()