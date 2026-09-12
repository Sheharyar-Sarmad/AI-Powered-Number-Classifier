

import os
from tensorflow.keras.models import load_model
from app.config import settings

class ModelLoader:
    _model = None

    @classmethod
    def load(cls):
        # Loads the model only once and caches it
        if cls._model is None:
            if not os.path.exists(settings.MODEL_PATH):
                raise RuntimeError(f"Model not found at {settings.MODEL_PATH}")
            print(f"Loading CNN model from {settings.MODEL_PATH}...")
            cls._model = load_model(settings.MODEL_PATH)
            print("Model ready.")
        return cls._model

    @classmethod
    def get(cls):
        return cls.load()