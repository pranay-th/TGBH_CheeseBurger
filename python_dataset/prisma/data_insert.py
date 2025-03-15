import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from prisma import Prisma
import json
import asyncio

# Connect to the Prisma Client
db = Prisma()

async def fetch_data():
    """
    Fetch mouse movements and tab switches from the database.
    """
    mouse_data = await db.mousemovement.find_many()
    tab_data = await db.tabswitch.find_many()
    return pd.DataFrame(mouse_data), pd.DataFrame(tab_data)

def feature_engineering(df, feature_type):
    """
    Perform feature engineering on the dataset.
    """
    if feature_type == "mouse":
        # Calculate time difference between movements
        df['time_diff'] = df['timestamp'].diff().dt.total_seconds().fillna(0)
        # Calculate movement distance (Euclidean distance)
        df['movement_distance'] = np.sqrt(df['xPos'].diff().pow(2) + df['yPos'].diff().pow(2)).fillna(0)
        # Calculate movement speed (distance / time)
        df['movement_speed'] = df['movement_distance'] / df['time_diff'].replace(0, np.nan).fillna(0)
        # Select relevant features
        return df[['userId', 'time_diff', 'movement_distance', 'movement_speed']]
    elif feature_type == "tab":
        # Calculate time difference between tab switches
        df['time_diff'] = df['timestamp'].diff().dt.total_seconds().fillna(0)
        # Count frequency of tab switches
        df['switch_frequency'] = df.groupby('userId')['timestamp'].transform('count')
        # Select relevant features
        return df[['userId', 'time_diff', 'switch_frequency']]

async def train_model(data):
    """
    Train an Isolation Forest model on the dataset.
    """
    model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
    data['riskScore'] = -model.fit_predict(data.drop(columns=['userId']))
    data['riskScore'] = np.clip(data['riskScore'], 0, 1)  # Normalize risk scores to [0, 1]
    return data, model

async def update_risk_scores(df, feature_type):
    """
    Insert risk scores and anomaly detection results into the database.
    """
    for _, row in df.iterrows():
        await db.anomalydetection.create(
            data={
                "userId": row['userId'],
                "timestamp": row['timestamp'],
                "featureSet": json.dumps(row.drop(['userId', 'timestamp', 'riskScore']).to_dict()),
                "riskScore": row['riskScore'],
                "isCheating": row['riskScore'] > 0.7  # Flag high-risk actions
            }
        )

async def main():
    """
    Main function to fetch data, train the model, and update risk scores.
    """
    await db.connect()

    try:
        # Fetch data from the database
        mouse_data, tab_data = await fetch_data()

        # Perform feature engineering
        mouse_features = feature_engineering(mouse_data, "mouse")
        tab_features = feature_engineering(tab_data, "tab")

        # Combine datasets for model training
        combined_data = pd.concat([mouse_features, tab_features], ignore_index=True)

        # Train the model
        scored_data, model = await train_model(combined_data)

        # Update risk scores in the database
        await update_risk_scores(scored_data, "combined")

        print("✅ Risk scores updated successfully!")

    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())