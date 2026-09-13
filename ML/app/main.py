from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import health, predict, welcome
from app.services.model_loader import ModelLoader

app = FastAPI(
    title="Digit Recognizer CNN API",
    description="Upload a handwritten digit and get a CNN prediction.",
    version="1.0.0",
)


# Load + warm up the model at startup
@app.on_event("startup")
def startup_event():
    ModelLoader.load()

    # Warmup — one dummy inference to prime the interpreter
    import numpy as np
    dummy = np.zeros((1, 28, 28, 1), dtype=np.float32)
    ModelLoader.predict(dummy)

    print("Service warmed up and ready.")


# Register routers
app.include_router(health.router)
app.include_router(predict.router)
app.include_router(welcome.router)