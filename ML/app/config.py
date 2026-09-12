
import os

class Settings:
    MODEL_PATH: str = os.getenv("MODEL_PATH", "data/cnn_model.keras")

    ALLOWED_CONTENT_TYPES: set[str] = {
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
    }
    ALLOWED_EXTENSIONS: set[str] = {".png", ".jpg", ".jpeg", ".webp"}

    MAX_FILE_SIZE_MB: int = 5
    MAX_FILE_SIZE_BYTES: int = MAX_FILE_SIZE_MB * 1024 * 1024

    IMAGE_SIZE: tuple[int, int] = (28, 28)
    NUM_CLASSES: int = 10

    CORS_ORIGINS: list[str] = ["*"]  # Change to your Next.js URL in prod

settings = Settings()