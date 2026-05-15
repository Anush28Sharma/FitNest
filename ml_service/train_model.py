import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# 1. Setup Data
def load_data():
    csv_path = 'ml_service/human_vital_signs_dataset_2024.csv'
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}")
    
    print(f"Loading dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    return df

print("Loading data...")
df = load_data()

# 2. Preprocessing
# Select relevant features based on dataset analysis
# Features: Heart Rate, Systolic BP, Diastolic BP, Body Temp, BMI, Age, Gender
# REMOVED: Oxygen Saturation
# Target: Risk Category

feature_columns = [
    'Heart Rate', 
    'Systolic Blood Pressure', 
    'Diastolic Blood Pressure', 
    'Body Temperature', 
    'Derived_BMI', 
    'Age', 
    'Gender'
]
target_column = 'Risk Category'

# Ensure all columns exist
missing_cols = [col for col in feature_columns + [target_column] if col not in df.columns]
if missing_cols:
    raise ValueError(f"Missing columns in dataset: {missing_cols}")

X = df[feature_columns].copy()
y = df[target_column].copy()

# Calculate Imputation Values (for optional Age/Gender in API)
print("Calculating imputation values...")
mean_age = int(X['Age'].mean())
mode_gender = X['Gender'].mode()[0]
imputer_values = {
    'age': mean_age,
    'gender': mode_gender
}
print(f"Imputation Defaults: {imputer_values}")

# Encode 'Gender'
print("Encoding Gender...")
gender_encoder = LabelEncoder()
X['Gender'] = gender_encoder.fit_transform(X['Gender'])

# Encode Target 'Risk Category'
print("Encoding Target...")
target_encoder = LabelEncoder()
y_encoded = target_encoder.fit_transform(y)

# Split data
print("Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

# 3. Train Model
print("Training Random Forest model...")
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train)

# 4. Evaluate
accuracy = clf.score(X_test, y_test)
print(f"Model Accuracy: {accuracy:.2f}")

# 5. Save Model and Artifacts
print("Saving model and artifacts...")
artifacts_path = 'ml_service/artifacts'
os.makedirs(artifacts_path, exist_ok=True)

# Save the model
joblib.dump(clf, os.path.join(artifacts_path, 'health_model.pkl'))

# Save the label encoders
joblib.dump(gender_encoder, os.path.join(artifacts_path, 'gender_encoder.pkl'))
joblib.dump(target_encoder, os.path.join(artifacts_path, 'target_encoder.pkl'))

# Save imputation values
joblib.dump(imputer_values, os.path.join(artifacts_path, 'imputer.pkl'))

print("Done! Model and artifacts saved to artifacts/")
