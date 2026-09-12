import type { Metadata } from "next";
import AboutPageWrapper from "@/components/AboutPageWrapper";

export const metadata: Metadata = {
  title: "About the Model | Digit Recognizer",
  description:
    "Learn about the CNN architecture, MNIST dataset, and 98.90% test accuracy behind this Digit Recognizer built with TensorFlow, FastAPI, and Next.js.",
  keywords: ["CNN", "MNIST", "TensorFlow", "digit recognition", "deep learning"],
};

export default function AboutPage() {
  return <AboutPageWrapper />;
}