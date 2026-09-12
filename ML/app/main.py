from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import health, predict, welcome  # ← all three as modules
from app.services.model_loader import ModelLoader

app = FastAPI(
    title="Digit Recognizer CNN API",
    description="Upload a handwritten digit and get a CNN prediction.",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model at startup
@app.on_event("startup")
def startup_event():
    ModelLoader.load()

# Register routers
app.include_router(health.router)
app.include_router(predict.router)
app.include_router(welcome.router)