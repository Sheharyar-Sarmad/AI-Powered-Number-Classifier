import type { Metadata } from "next";
import HomePageWrapper from "@/components/HomePageWrapper";

export const metadata: Metadata = {
  title: "Digit Recognizer | Real-time CNN Predictions",
  description:
    "Draw a handwritten digit (0-9) and let our Convolutional Neural Network predict it in real-time with 98.90% accuracy.",
  keywords: ["digit recognizer", "CNN", "MNIST", "deep learning", "TensorFlow"],
};

export default function HomePage() {
  return <HomePageWrapper />;
}