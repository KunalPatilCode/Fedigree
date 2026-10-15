import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "models_loaded" in data

def test_idrs_calculation():
    payload = {
        "age_years": 52.0,
        "gender": "male",
        "waist_circumference_cm": 94.0,
        "physical_activity": "sedentary",
        "family_history_diabetes": "both_parents"
    }
    response = client.post("/api/v1/diabetes/idrs", json=payload)
    assert response.status_code == 200
    data = response.json()
    # Age >= 50 (30) + Waist >= 90 (20) + Sedentary (30) + Both parents (20) = 100
    assert data["score"] == 100
    assert data["risk_level"] == "High"

def test_diabetes_ml_predict():
    payload = {
        "age_years": 55.0,
        "sex_code": 1,
        "residence_code": 1,
        "mpce_quintile": 3,
        "education_level": "level_2",
        "family_history_diabetes": 1,
        "hypertension_history": 1,
        "high_cholesterol_history": 0,
        "tobacco_ever": 0,
        "vigorous_activity_frequency": 4,
        "moderate_activity_frequency": 3
    }
    response = client.post("/api/v1/diabetes/predict-ml", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_class" in data
    assert "probability" in data
    assert data["task_name"] == "diabetes_diagnosis_classification"

def test_cvd_ml_predict():
    payload = {
        "age_years": 60.0,
        "sex_code": 1,
        "residence_code": 1,
        "mpce_quintile": 4,
        "education_level": "level_2",
        "family_history_hypertension": 1,
        "family_history_heart_disease": 1,
        "family_history_stroke": 0,
        "diabetes_reported": 1,
        "high_cholesterol_history": 1,
        "tobacco_ever": 1,
        "vigorous_activity_frequency": 4,
        "moderate_activity_frequency": 4
    }
    response = client.post("/api/v1/cvd/predict-ml", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_class" in data
    assert "probability" in data
    assert data["task_name"] == "cvd_composite_classification"

def test_aqi_district():
    response = client.get("/api/v1/aqi/data/pune")
    assert response.status_code == 200
    data = response.json()
    assert data["district"] == "Pune"
    assert data["aqi"] > 0
