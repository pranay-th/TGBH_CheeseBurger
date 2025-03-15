import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from prisma import Prisma
import json

# Connect to the Prisma Client
db = Prisma()
db.connect()

# Load data from the database
def fetch_data():
    mouse_data = db.mousemovement.find_many()
    tab_data = db.tabswitch.find_many()
    return pd.DataFrame(mouse_data), pd.DataFrame(tab_data)

# Feature Engineering
def feature_engineering(df):
    df['time_diff'] = df['timestamp'].diff().dt.total_seconds().fillna(0)
    df['movement_score'] = np.sqrt(df['xPos']**2 + df['yPos']**2)
    return df[['userId', 'time_diff', 'movement_score']]

# Train Isolation Forest Model
def train_model(data):
    model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
    data['riskScore'] = -model.fit_predict(data[['time_diff', 'movement_score']])
    data['riskScore'] = np.clip(data['riskScore'], 0, 1)
    return data, model

# Insert Risk Scores Back to Database
def update_risk_scores(df, model):
    for _, row in df.iterrows():
        db.anomalydetection.create(
            data={
                "userId": row['userId'],
                "timestamp": row['timestamp'],
                "featureSet": json.dumps({
                    "time_diff": row['time_diff'],
                    "movement_score": row['movement_score']
                }),
                "riskScore": row['riskScore'],
                "isCheating": row['riskScore'] > 0.7  # Flag high-risk actions
            }
        )

def main():
    mouse_data, tab_data = fetch_data()

    # Combine datasets for model training
    combined_data = pd.concat([feature_engineering(mouse_data), feature_engineering(tab_data)], ignore_index=True)

    # Train the model and update risk scores
    scored_data, model = train_model(combined_data)
    update_risk_scores(scored_data, model)

    print("✅ Risk scores updated successfully!")

if __name__ == "__main__":
    main()
