import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
import joblib
import os

print("📚 Data load kar rahe hain...")
df = pd.read_csv('crowd_data.csv')

# location ko number mein convert karo
locations = df['location'].unique()
loc_to_idx = {loc: i for i, loc in enumerate(locations)}
df['location_idx'] = df['location'].map(loc_to_idx)

# save karo location mapping
joblib.dump(loc_to_idx, 'loc_to_idx.pkl')
print(f"✅ {len(locations)} locations found")

# features: hour, day_of_week, location_idx
# target: count

X = df[['hour', 'day_of_week', 'location_idx']].values
y = df['count'].values

# scale karo
scaler_X = MinMaxScaler()
scaler_y = MinMaxScaler()

X_scaled = scaler_X.fit_transform(X)
y_scaled = scaler_y.fit_transform(y.reshape(-1, 1))

# scalers save karo
joblib.dump(scaler_X, 'scaler_X.pkl')
joblib.dump(scaler_y, 'scaler_y.pkl')

# LSTM ke liye sequences banao — 24 timesteps (ek din ke hours)
SEQ_LEN = 24

def create_sequences(X, y, seq_len):
    Xs, ys = [], []
    for i in range(len(X) - seq_len):
        Xs.append(X[i:i+seq_len])
        ys.append(y[i+seq_len])
    return np.array(Xs), np.array(ys)

print("🔄 Sequences bana rahe hain...")
X_seq, y_seq = create_sequences(X_scaled, y_scaled, SEQ_LEN)

# train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X_seq, y_seq, test_size=0.2, random_state=42
)

print(f"Training samples: {len(X_train)}")
print(f"Test samples: {len(X_test)}")

# LSTM model banao
print("\n🧠 Model bana rahe hain...")
model = Sequential([
    LSTM(64, return_sequences=True, input_shape=(SEQ_LEN, 3)),
    Dropout(0.2),
    LSTM(32, return_sequences=False),
    Dropout(0.2),
    Dense(16, activation='relu'),
    Dense(1)
])

model.compile(optimizer='adam', loss='mse', metrics=['mae'])
model.summary()

# train karo
print("\n🚀 Training shuru...")
history = model.fit(
    X_train, y_train,
    epochs=20,
    batch_size=32,
    validation_data=(X_test, y_test),
    verbose=1
)

# evaluate karo
loss, mae = model.evaluate(X_test, y_test, verbose=0)
print(f"\n✅ Test MAE: {mae:.4f}")

# model save karo
model.save('crowd_model.h5')
print("✅ Model saved: crowd_model.h5")
print("✅ Training complete!")