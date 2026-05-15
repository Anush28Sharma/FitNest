from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
import joblib
import pandas as pd
import numpy as np
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FitNest ML Service", root_path="/fitnest")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")
FOOD_DATA_PATH = os.path.join(BASE_DIR, "Nutrition_Data_Processed.csv")

# Load Model Artifacts
model = None
gender_encoder = None
target_encoder = None
imputer_values = None

# Robust Artifact Loading
def load_artifacts():
    global model, gender_encoder, target_encoder, imputer_values
    
    # Try multiple possible locations
    possible_dirs = [
        os.path.join(BASE_DIR, "artifacts"),
        os.path.join(os.getcwd(), "ml_service", "artifacts"),
        os.path.join(os.getcwd(), "artifacts")
    ]
    
    for artifacts_dir in possible_dirs:
        try:
            model_path = os.path.join(artifacts_dir, "health_model.pkl")
            if os.path.exists(model_path):
                print(f"🔍 Discovered artifacts at: {artifacts_dir}")
                model = joblib.load(model_path)
                gender_encoder = joblib.load(os.path.join(artifacts_dir, "gender_encoder.pkl"))
                target_encoder = joblib.load(os.path.join(artifacts_dir, "target_encoder.pkl"))
                imputer_values = joblib.load(os.path.join(artifacts_dir, "imputer.pkl"))
                print("✅ ML Model artifacts loaded successfully.")
                return True
        except Exception as e:
            print(f"⚠️ Failed to load from {artifacts_dir}: {e}")
            
    print("❌ All artifact locations exhausted. /predict will be disabled.")
    return False

load_artifacts()

# Load and Clean Food Dataset
food_df = None
try:
    if os.path.exists(FOOD_DATA_PATH):
        food_df = pd.read_csv(FOOD_DATA_PATH)
        # Robust column cleaning
        orig_cols = list(food_df.columns)
        new_cols = []
        for c in orig_cols:
            clean = c.split('(')[0].strip().lower().replace(' ', '_')
            new_cols.append(clean)
        food_df.columns = new_cols
        print(f"✅ Indian Food Dataset loaded: {len(food_df)} dishes.")
        print(f"Columns discovered: {list(food_df.columns)}")
    else:
        print(f"❌ Food dataset not found at {FOOD_DATA_PATH}")
except Exception as e:
    print(f"❌ Error loading food dataset: {e}")

class HealthInput(BaseModel):
    bmi: float
    heart_rate: float
    systolic_bp: float
    diastolic_bp: float
    body_temperature: float
    age: Optional[int] = None
    gender: Optional[str] = None

@app.get("/")
def read_root():
    return {
        "status": "online",
        "features": {
            "food_search": food_df is not None,
            "predictions": model is not None
        }
    }

@app.get("/food/search")
def search_food(q: str = Query(..., min_length=1)):
    if food_df is None:
        return []
    
    try:
        # Search in 'dish_name' (cleaned from 'Dish Name')
        query = q.lower()
        results = food_df[food_df['dish_name'].str.contains(query, case=False, na=False)].head(15)
        
        # Select standard columns
        out_cols = ['dish_name', 'calories', 'protein', 'carbohydrates', 'fats']
        # Map to dict, handle missing columns gracefully
        return results[[c for c in out_cols if c in results.columns]].to_dict(orient='records')
    except Exception as e:
        print(f"❌ Search error: {e}")
        return []

@app.get("/food/recommend")
def recommend_food(goal: str):
    if food_df is None:
        return []
    
    try:
        if goal == 'weight_loss':
            recs = food_df[food_df['calories'] < 250]
        elif goal == 'muscle_gain':
            recs = food_df[food_df['protein'] > 12]
        else:
            recs = food_df
            
        if recs.empty:
            recs = food_df.head(10)
            
        sample_size = min(4, len(recs))
        out_cols = ['dish_name', 'calories', 'protein', 'carbohydrates', 'fats']
        return recs.sample(sample_size)[[c for c in out_cols if c in recs.columns]].to_dict(orient='records')
    except Exception as e:
        print(f"❌ Recommendation error: {e}")
        return []

@app.post("/predict")
def predict_health_status(data: HealthInput):
    # 1. MEDICAL GUARDRAILS (Logic Override)
    # The ML model is trained on a specific dataset range. 
    # For a professional showcase, we implement medical logic to handle extreme outliers.
    
    overridden_reason = None
    
    # High BP Guardrail (Hypertension Stage 2 Thresholds)
    if data.systolic_bp >= 160 or data.diastolic_bp >= 100:
        overridden_reason = "Hypertensive Crisis/Stage 2 (Vitals Override)"
    # High Heart Rate Guardrail (Severe Tachycardia)
    elif data.heart_rate >= 140:
        overridden_reason = "Severe Tachycardia (Vitals Override)"
    # High Temp Guardrail (Fever)
    elif data.body_temperature >= 39.0:
        overridden_reason = "High Fever (Vitals Override)"
    # Extreme BMI Guardrail
    elif data.bmi >= 35.0:
        overridden_reason = "Severe Obesity (Vitals Override)"

    if overridden_reason:
        return {
            "status": "High Risk",
            "confidence": 1.0,
            "input": data.dict(),
            "note": overridden_reason
        }

    # 2. ML PREDICTION (If not overridden)
    if model is None:
        raise HTTPException(status_code=503, detail="Prediction model not available")
    
    try:
        age = data.age or imputer_values['age']
        gender = data.gender or imputer_values['gender']
        
        try:
            gender_encoded_val = gender_encoder.transform([gender])[0]
        except:
            gender_encoded_val = gender_encoder.transform([imputer_values['gender']])[0]

        input_data = [
            data.heart_rate, data.systolic_bp, data.diastolic_bp,
            data.body_temperature, data.bmi, age, gender_encoded_val
        ]
        
        feature_columns = ['Heart Rate', 'Systolic Blood Pressure', 'Diastolic Blood Pressure', 
                           'Body Temperature', 'Derived_BMI', 'Age', 'Gender']
        
        input_df = pd.DataFrame([input_data], columns=feature_columns)
        
        prediction_idx = model.predict(input_df)[0]
        prediction_label = target_encoder.inverse_transform([prediction_idx])[0]
        confidence = float(max(model.predict_proba(input_df)[0]))
        
        return {
            "status": prediction_label,
            "confidence": confidence,
            "input": data.dict()
        }
    except Exception as e:
        print(f"❌ Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
