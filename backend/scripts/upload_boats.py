import pandas as pd
import requests

# Configuration
CSV_FILE = 'sample_data/boats.csv'  # Replace with the path to your CSV file
API_URL = 'http://localhost:5000/boat_listings'  # Base URL for your API

# Load CSV Data
def load_csv(file_path):
    return pd.read_csv(file_path)

# Prepare Payload for API
def create_payload(row):
    return {
        "index": row["Boat index"],  # Replace with actual column name
        "name": row["Name of Vessel"] if pd.notnull(row["Name of Vessel"]) else None,
        "customer_name": row["Customer Name"] if pd.notnull(row["Customer Name"]) else None,
        "size": row["Size"] if pd.notnull(row["Size"]) else None,
        "make_model": row["Type of Vehicle"] if pd.notnull(row["Type of Vehicle"]) else None,
        # "mapped": False,
        "vehicle_type": row["Type"] if pd.notnull(row["Type"]) else None,
        "notes": row["Notes"] if pd.notnull(row["Notes"]) else None,
        "section": "",  # Add a default value for section if not present in your CSV
        "boat_on_map_id": None,
    }

# Push Data to API
def push_data_to_api(row):
    payload = create_payload(row)
    response = requests.post(API_URL, json=payload)
    if response.status_code == 201:
        print(response.json())
        print(f"Successfully added: {payload['name']} with ID: {response.json()['boat_listing_id']}")
    else:
        print(f"Failed to add: {payload['name']}. Error: {response.text}")

# Main Function
def main():
    # Load CSV data
    df = load_csv(CSV_FILE)

    # Iterate over DataFrame rows and push to API
    for index, row in df.iterrows():
        push_data_to_api(row)

if __name__ == "__main__":
    main()
