import pandas as pd
import requests

# Load your converted CSV file
csv_file = "EventLog.csv"
data = pd.read_csv(csv_file)

# URL for importing data into Label Studio
LABEL_STUDIO_URL = http://localhost:8081/projects/1/settings/ml
HEADERS = {"Authorization": "Token YOUR_ACCESS_TOKEN"}

# Format data for Label Studio
tasks = [
    {
        "data": {
            "text": row['text'],
            "isCheating": "Yes" if row['isCheating'] else "No",
            "movementType": "Yes" if row['movementType'] else "No",
            "riskScore": row['riskScore']
        }
    }
    for _, row in data.iterrows()
]

# Send data to Label Studio
for task in tasks:
    requests.post(LABEL_STUDIO_URL, headers=HEADERS, json=task)
