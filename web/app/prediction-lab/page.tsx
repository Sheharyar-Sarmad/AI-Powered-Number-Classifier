import type { Metadata } from "next";
import PredictionPageWrapper from "@/components/PredictionPageWrapper";

export const metadata: Metadata = {
  title: "Prediction Lab | Draw & Predict Digits with AI",
  description:
    "Draw, upload, or speak a handwritten digit (0-9) and get an instant CNN prediction with full probability breakdown. Real-time inference powered by TensorFlow and FastAPI with 98.90% accuracy.",

  // SEO Keywords
  keywords: [
    "digit prediction",
    "digit recognizer",
    "draw digit",
    "handwritten digit recognition",
    "real-time CNN prediction",
    "AI digit classifier",
    "CNN inference",
    "MNIST prediction",
    "image classification",
    "TensorFlow inference",
    "machine learning demo",
    "neural network prediction",
    "digit classifier app",
  ],

  // Authorship
  authors: [
    { name: "Sheharyar Sarmad", url: "https://github.com/Sheharyar-Sarmad/" },
  ],
  creator: "Sheharyar Sarmad",
  publisher: "Sheharyar Sarmad",

  // Canonical URL — update after Vercel deploy
  alternates: {
    canonical: "https://ai-powered-number-classifier.vercel.app/prediction-lab",
  },

  // Open Graph (Facebook, LinkedIn, WhatsApp, etc.)
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ai-powered-number-classifier.vercel.app/prediction-lab",
    siteName: "Digit Recognizer",
    title: "Prediction Lab | Draw & Predict Digits with AI",
    description:
      "Draw, upload, or speak a handwritten digit and get an instant CNN prediction with full probability breakdown.",
    images: [
      {
        url: "/meta_prediction_lab_banner.png",
        width: 1200,
        height: 630,
        alt: "Digit Recognizer — Prediction Lab",
        type: "image/png",
      },
    ],
  },

  // Twitter / X Card
  twitter: {
    card: "summary_large_image",
    title: "Prediction Lab | Draw & Predict Digits with AI",
    description:
      "Draw, upload, or speak a handwritten digit. Instant CNN predictions in real time.",
    images: ["/meta_prediction_lab_banner.png"],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Extra
  category: "Technology",
  applicationName: "Digit Recognizer",
};

export default function PredictionLabPage() {
  return <PredictionPageWrapper />;
}