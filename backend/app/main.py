from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import diabetes, cvd, aqi, health

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API serving LASI ML models, validated IDRS calculation, and environmental exposure metrics for Fedigree."
)

# Enable CORS for Frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount endpoints
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["Health"])
app.include_router(diabetes.router, prefix=f"{settings.API_V1_STR}/diabetes", tags=["Diabetes"])
app.include_router(cvd.router, prefix=f"{settings.API_V1_STR}/cvd", tags=["CVD"])
app.include_router(aqi.router, prefix=f"{settings.API_V1_STR}/aqi", tags=["Environment & AQI"])

@app.get("/")
def root():
    return {
        "message": "Welcome to Fedigree NCD Risk & Prevention API",
        "docs_url": "/docs",
        "health_check": f"{settings.API_V1_STR}/health"
    }
