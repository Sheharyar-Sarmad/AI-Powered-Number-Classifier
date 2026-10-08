# AI-Powered Number Classifier

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue?style=for-the-badge&logo=python)](https://www.python.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-orange?style=for-the-badge&logo=tensorflow)](https://www.tensorflow.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-13%2B-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**Draw a digit (0-9) in your browser and a CNN recognizes it in real time, with a live confidence chart for all 10 digits.**

[Live Demo](https://ai-powered-number-classifier-brown.vercel.app/) | [Backend API](https://ai-powered-number-classifier-ovuw.onrender.com) | [Repository](https://github.com/Sheharyar-Sarmad/AI-Powered-Number-Classifier)

> The backend runs on a free Render instance, so the first prediction after a period of inactivity can take 30-60 seconds while the service wakes up.

---

## Overview

AI-Powered Number Classifier is a full-stack handwritten digit recognition app. A Next.js frontend provides a drawing canvas, sends the image to a FastAPI backend, and the backend runs a trained TensorFlow/Keras Convolutional Neural Network and returns the predicted digit with probabilities for every class.

**Highlights**

- **98.90% test accuracy** on a held-out test set
- **Interactive canvas** with mouse and touch support
- **Transparent results**: confidence for all 10 digits, not just the top guess
- **Input validation** on the API (file type, extension and size checks) with clear error responses
- **Fast inference**: typically under 100 ms on the backend once the model is loaded

---

## Model

| Metric | Value |
|---|---|
| Test accuracy | 98.90% |
| Precision (avg) | 98.9% |
| Recall (avg) | 98.7% |
| F1 score | 98.8% |
| Specificity | 99.8% |
| Training data | 42,000 labeled handwritten digit images |
| Validation split | 20% |

**Architecture**

- 2 convolutional blocks (Conv2D + ReLU + MaxPooling)
- Batch Normalization for stable training
- Dropout for regularization
- Dense layers with a softmax output over 10 classes
- Optimizer: Adam | Loss: Categorical Crossentropy

---

## How It Works

1. **Draw**: the user draws a digit on the canvas.
2. **Send**: clicking *Predict* sends the image to the FastAPI backend.
3. **Predict**: the image is preprocessed and passed through the CNN.
4. **Display**: the frontend shows the predicted digit and a live probability chart.

```
┌──────────────┐      Canvas image      ┌─────────────┐      ┌──────────────┐
│   Next.js    │ ─────────────────────> │   FastAPI   │ ───> │  Keras CNN   │
│  (Frontend)  │ <───────────────────── │  (Backend)  │ <─── │   (.h5)      │
└──────────────┘  Digit + probabilities └─────────────┘      └──────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Machine learning | TensorFlow, Keras, NumPy, Pillow |
| Backend | FastAPI, Uvicorn, Pydantic |
| Frontend | Next.js, React, TypeScript, Tailwind CSS, GSAP |
| Hosting | Vercel (frontend), Render (backend) |

---

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+ and npm
- Git

### Backend

```bash
git clone https://github.com/Sheharyar-Sarmad/AI-Powered-Number-Classifier.git
cd AI-Powered-Number-Classifier/backend

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API: `http://localhost:8000` | Swagger docs: `http://localhost:8000/docs` | ReDoc: `http://localhost:8000/redoc`

### Frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Then run:

```bash
npm run dev
```

App: `http://localhost:3000`

To build for production: `npm run build && npm run start`

---

## API Reference

### `POST /predict`

Submit a drawn digit image and receive the prediction with confidence scores.

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{"image": "base64_encoded_image_data"}'
```

**Response**

```json
{
  "predicted_digit": 7,
  "confidence": 0.9956,
  "probabilities": {
    "0": 0.0001, "1": 0.0002, "2": 0.0005, "3": 0.0008, "4": 0.0012,
    "5": 0.0011, "6": 0.0003, "7": 0.9956, "8": 0.0001, "9": 0.0001
  },
  "inference_time_ms": 45.23
}
```

| Status | Meaning |
|---|---|
| `200` | Prediction successful |
| `400` | Invalid image format or size |
| `422` | Validation error |
| `500` | Server error |

### `GET /health`

Returns API status and whether the model is loaded.

---

## Project Structure

```
AI-Powered-Number-Classifier/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── models.py               # Pydantic request/response models
│   ├── utils.py                # Image preprocessing and helpers
│   ├── model/
│   │   └── digit_classifier.h5 # Trained Keras model
│   └── requirements.txt
│
├── frontend/
│   ├── app/                    # Next.js App Router (page, layout, styles)
│   ├── components/             # Canvas, PredictionChart, Header
│   ├── lib/                    # API client and helpers
│   └── package.json
│
└── README.md
```

---

## Known Limitations

- Predicts **one digit at a time**; multi-digit input is not supported.
- Accuracy is measured on a clean, centered dataset. Real drawings that are off-center, very thin or very small can reduce confidence.
- Free-tier hosting means cold starts on the first request.

## Roadmap

- [ ] Multi-digit recognition
- [ ] Model quantization (TensorFlow Lite) for faster inference
- [ ] Automated tests for the API and preprocessing
- [ ] Prediction history
- [ ] Light/dark theme toggle

---

## Contributing

Issues and pull requests are welcome. For larger changes, please open an issue first to discuss the approach: [Issues](https://github.com/Sheharyar-Sarmad/AI-Powered-Number-Classifier/issues).

## License

Released under the [MIT License](LICENSE).

## Author

**Sheharyar Sarmad**

- GitHub: [Sheharyar-Sarmad](https://github.com/Sheharyar-Sarmad)
- LinkedIn: [sheharyar-sarmad](https://www.linkedin.com/in/sheharyar-sarmad-9b7736289/)
- Email: [developersheharyar2010@gmail.com](mailto:developersheharyar2010@gmail.com)

## Acknowledgments

- Yann LeCun, Corinna Cortes and Christopher J.C. Burges for the MNIST digit dataset
- The TensorFlow/Keras, FastAPI, Next.js and React communities
