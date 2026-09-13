import type { Metadata } from "next";
import HomePageWrapper from "@/components/HomePageWrapper";

export const metadata: Metadata = {
  title: "Digit Recognizer | Real-time CNN Predictions",
  description:
    "Draw, upload, or speak a handwritten digit (0-9) and let our Convolutional Neural Network predict it in real-time with 98.90% accuracy on the MNIST dataset. Powered by TensorFlow, FastAPI, and Next.js.",

  // SEO
  keywords: [
    "digit recognizer",
    "handwritten digit recognition",
    "CNN",
    "convolutional neural network",
    "MNIST",
    "deep learning",
    "machine learning",
    "TensorFlow",
    "Keras",
    "FastAPI",
    "Next.js",
    "digit classification",
    "AI digit predictor",
    "image classification",
  ],

  authors: [{ name: "Sheharyar Sarmad", url: "https://github.com/Sheharyar-Sarmad/" }],
  creator: "Sheharyar Sarmad",
  publisher: "Sheharyar Sarmad",

  // Canonical URL — update after Vercel deploy
  alternates: {
    canonical: "https://ai-powered-number-classifier.vercel.app",
  },

  // Open Graph — Facebook, LinkedIn, WhatsApp, etc.
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ai-powered-number-classifier.vercel.app",
    siteName: "Digit Recognizer",
    title: "Digit Recognizer | Real-time CNN Predictions",
    description:
      "Draw a handwritten digit and let our CNN predict it in real-time with 98.90% accuracy. Powered by TensorFlow + FastAPI + Next.js.",
    images: [
      {
        url: "/meta_home_banner.png",
        width: 1200,
        height: 630,
        alt: "Digit Recognizer — Real-time CNN Predictions",
        type: "image/png",
      },
    ],
  },

  // Twitter / X
  twitter: {
    card: "summary_large_image",
    title: "Digit Recognizer | Real-time CNN Predictions",
    description:
      "Draw a handwritten digit and let our CNN predict it in real-time with 98.90% accuracy.",
    images: ["/meta_home_banner.png"],
    creator: "@SheharyarSarmad", // update if you have Twitter
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

  // Icons
  icons: {
    icon: "/meta_logo.png",
    shortcut: "/meta_logo.png",
    apple: "/meta_logo.png",
  },

  // Extra
  category: "Technology",
  applicationName: "Digit Recognizer",
};

export default function HomePage() {
  return <HomePageWrapper />;
}