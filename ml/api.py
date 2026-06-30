from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import joblib
import tensorflow as tf
from datetime import datetime

app = FastAPI()

# model aur scalers load karo
print("🔄 Model load kar rahe hain...")
model = tf.keras.models.load_model(
    "crowd_model.h5",
    compile=False
)
scaler_X = joblib.load('scaler_X.pkl')
scaler_y = joblib.load('scaler_y.pkl')
loc_to_idx = joblib.load('loc_to_idx.pkl')
print("✅ Model loaded!")

class PredictRequest(BaseModel):
    location_name: str
    hour: int
    day_of_week: int

@app.get("/")
def root():
    return {"message": "SmartCampus ML API running!"}

@app.post("/predict")
def predict(req: PredictRequest):
    try:
        # location index dhundho
        if req.location_name not in loc_to_idx:
            return {"error": f"Location not found: {req.location_name}"}

        loc_idx = loc_to_idx[req.location_name]

        # sequence banao — 24 timesteps
        sequence = []
        for h in range(24):
            hour = (req.hour - 23 + h) % 24
            sequence.append([hour, req.day_of_week, loc_idx])

        sequence = np.array(sequence)
        sequence_scaled = scaler_X.transform(sequence)
        sequence_scaled = sequence_scaled.reshape(1, 24, 3)

        # predict karo
        pred_scaled = model.predict(sequence_scaled, verbose=0)
        pred = scaler_y.inverse_transform(pred_scaled)[0][0]
        pred = max(0, min(100, int(pred)))

        # confidence
        confidence = "high" if 20 <= pred <= 80 else "medium"

        return {
            "location": req.location_name,
            "predicted_count": pred,
            "predicted_wait_min": max(1, pred // 10),
            "confidence": confidence,
            "hour": req.hour,
            "day_of_week": req.day_of_week
        }

    except Exception as e:
        return {"error": str(e)}

@app.get("/locations")
def get_locations():
    return {"locations": list(loc_to_idx.keys())}