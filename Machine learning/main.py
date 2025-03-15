import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.preprocessing import StandardScaler
from prisma import Prisma

# Database Connection
prisma = Prisma()

async def fetch_data():
    await prisma.connect()
    data = await prisma.data.find_many()
    await prisma.disconnect()
    return pd.DataFrame(data)

# Load and preprocess data
df = await fetch_data()
features = ['feature1', 'feature2', 'feature3']  # Specify your features
scaler = StandardScaler()
X = scaler.fit_transform(df[features])

# Isolation Forest Model
iso_forest = IsolationForest(contamination=0.05)
df['iso_forest_score'] = iso_forest.fit_predict(X)

# Autoencoder Model
input_dim = X.shape[1]
autoencoder = keras.models.Sequential([
    layers.Input(shape=(input_dim,)),
    layers.Dense(64, activation='relu'),
    layers.Dense(32, activation='relu'),
    layers.Dense(64, activation='relu'),
    layers.Dense(input_dim, activation='linear')
])

autoencoder.compile(optimizer='adam', loss='mse')

# Train Autoencoder
autoencoder.fit(X, X, epochs=20, batch_size=32, shuffle=True)

# Calculate reconstruction error
X_pred = autoencoder.predict(X)
reconstruction_error = np.mean(np.abs(X - X_pred), axis=1)

df['autoencoder_score'] = reconstruction_error

# Anomaly Detection Logic
df['anomaly'] = ((df['iso_forest_score'] == -1) | (df['autoencoder_score'] > 0.1)).astype(int)

# Save anomalies back to PostgreSQL
async def save_anomalies():
    await prisma.connect()
    for _, row in df.iterrows():
        await prisma.anomalies.create({
            'id': row['id'],
            'iso_forest_score': row['iso_forest_score'],
            'autoencoder_score': row['autoencoder_score'],
            'anomaly': row['anomaly']
        })
    await prisma.disconnect()

await save_anomalies()

print("Anomaly detection completed and data saved successfully!")
