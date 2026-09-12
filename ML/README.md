# 🧠 DL — Digit Classification API

FastAPI backend that serves a trained TensorFlow CNN for classifying handwritten digits (0–9), achieving ~98.90% accuracy on the MNIST dataset.

## Overview

The application loads the trained Keras model once at startup and exposes REST endpoints for health checks and real-time predictions. It handles image uploads, validates file types and sizes, preprocesses images to 28×28 grayscale, and returns predictions along with confidence scores and full probability distributions over all 10 classes.

## Tech Stack

- **FastAPI** — modern async web framework
- **Uvicorn** — ASGI server
- **TensorFlow / Keras** — model inference
- **Pydantic** — request/response validation
- **Pillow** — image processing
- **NumPy** — array manipulation

## Endpoints

- `GET /health` — service and model status
- `POST /predict` — accepts an image (PNG · JPG · JPEG · WebP, max 5MB), returns prediction + probabilities

## Model

Convolutional Neural Network trained on MNIST (28×28 grayscale input, 10 output classes). Weights stored in `data/cnn_model.keras`; training notebook in `notebooks/`.

## Running

```bash
python run.py
Or directly with Uvicorn. Interactive docs available at /docs.
```

## Integration

CORS is pre-configured for the Next.js frontend. Just point the frontend's NEXT_PUBLIC_API_BASE_URL to this backend.