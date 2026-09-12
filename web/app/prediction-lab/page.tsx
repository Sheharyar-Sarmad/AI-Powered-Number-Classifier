import type { Metadata } from "next";
import PredictionPageWrapper from "@/components/PredictionPageWrapper";

export const metadata: Metadata = {
  title: "Prediction Lab | Digit Recognizer",
  description:
    "Draw a digit on the canvas and get an instant CNN prediction with full probability breakdown.",
  keywords: ["digit prediction", "CNN", "handwritten digit", "MNIST"],
};

export default function PredictionLabPage() {
  return <PredictionPageWrapper />;
}