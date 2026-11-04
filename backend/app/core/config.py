from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path

class Settings(BaseSettings):
    PROJECT_NAME: str = "Fedigree NCD Risk & Prevention API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Exact origins allowed (no glob patterns — use allow_origin_regex for previews)
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        # ── Production Vercel frontend ──────────────────────────────
        # Update this to your actual Vercel URL after deploying frontend
        "https://fedigree.vercel.app",
        "https://fedigree-git-main-kunalpatilcodes-projects.vercel.app",
    ]

    # Regex covers ALL Vercel preview deployments automatically
    CORS_ORIGIN_REGEX: str = r"https://fedigree.*\.vercel\.app"

    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent.parent
    MODELS_DIR: Path = BASE_DIR / "models"

    # Selected Model Artifacts
    DIABETES_MODEL_PATH: Path = MODELS_DIR / "diabetes_random_forest_lasi_dd.joblib"
    DIABETES_TUNED_MODEL_PATH: Path = MODELS_DIR / "diabetes_random_forest_tuned_lasi_dd.joblib"
    CVD_MODEL_PATH: Path = MODELS_DIR / "cvd_composite_logistic_regression_lasi_dd.joblib"

    class Config:
        case_sensitive = True

settings = Settings()
