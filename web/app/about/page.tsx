import type { Metadata } from "next";
import AboutPageWrapper from "@/components/AboutPageWrapper";

export const metadata: Metadata = {
  title: "About the Model | CNN Architecture & MNIST Training",
  description:
    "Explore the Convolutional Neural Network behind our digit recognizer — its architecture, the MNIST dataset it trained on, and how it reaches 98.90% test accuracy with TensorFlow, Keras, and FastAPI.",

  // SEO Keywords
  keywords: [
    "CNN architecture",
    "MNIST dataset",
    "TensorFlow model",
    "Keras CNN",
    "deep learning architecture",
    "neural network training",
    "digit classification model",
    "model accuracy",
    "98.90% accuracy CNN",
    "machine learning model",
    "convolutional neural network explained",
    "FastAPI ML deployment",
    "model training details",
  ],

  // Authorship
  authors: [
    { name: "Sheharyar Sarmad", url: "https://github.com/Sheharyar-Sarmad/" },
  ],
  creator: "Sheharyar Sarmad",
  publisher: "Sheharyar Sarmad",

  // Canonical URL — update after Vercel deploy
  alternates: {
    canonical: "https://ai-powered-number-classifier.vercel.app/about",
  },

  // Open Graph
  openGraph: {
    type: "article",
    locale: "en_US",
    url: "https://ai-powered-number-classifier.vercel.app/about",
    siteName: "Digit Recognizer",
    title: "About the Model | CNN Architecture & MNIST Training",
    description:
      "Deep dive into the CNN architecture, MNIST dataset, and 98.90% test accuracy of our digit recognizer.",
    images: [
      {
        url: "/meta_about_banner.png",
        width: 1200,
        height: 630,
        alt: "About the CNN Model — Architecture & Training",
        type: "image/png",
      },
    ],
  },

  // Twitter / X Card
  twitter: {
    card: "summary_large_image",
    title: "About the Model | CNN Architecture & MNIST Training",
    description:
      "CNN architecture, MNIST dataset, and 98.90% test accuracy explained.",
    images: ["/meta_about_banner.png"],
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

export default function AboutPage() {
  return <AboutPageWrapper />;
}