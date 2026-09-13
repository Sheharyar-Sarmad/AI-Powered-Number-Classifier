"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Brain,
  Database,
  Target,
  Layers,
  Code2,
  ExternalLink,
  TrendingUp,
  Split,
  Cpu,
  Sparkles,
  CheckCircle2,
  Activity,
  Zap,
  Award,
  BookOpen,
  ChevronDown,
  ArrowRight, // ← ADD THIS
  BarChart3,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa6";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const MODEL_STATS = [
  { label: "Test Accuracy", value: "98.90%", icon: Target },
  { label: "Training Samples", value: "42,000", icon: Database },
  { label: "Test Split", value: "20%", icon: Split },
  { label: "Framework", value: "TensorFlow", icon: Cpu },
];

const ARCHITECTURE = [
  { layer: "Conv2D", detail: "32 filters · 3×3 · ReLU" },
  { layer: "MaxPooling2D", detail: "2×2" },
  { layer: "Conv2D", detail: "64 filters · 3×3 · ReLU" },
  { layer: "MaxPooling2D", detail: "2×2" },
  { layer: "Flatten", detail: "—" },
  { layer: "Dense", detail: "128 units · ReLU" },
  { layer: "Dropout", detail: "rate = 0.5" },
  { layer: "Dense (Output)", detail: "10 units · Softmax" },
];

const METRICS = [
  {
    label: "Precision (avg)",
    value: 98.9,
    color: "from-violet-500 to-violet-400",
  },
  {
    label: "Recall (avg)",
    value: 98.7,
    color: "from-indigo-500 to-indigo-400",
  },
  { label: "F1 Score", value: 98.8, color: "from-fuchsia-500 to-fuchsia-400" },
  { label: "Specificity", value: 99.8, color: "from-blue-500 to-blue-400" },
];

const TRAINING_DETAILS = [
  {
    icon: Zap,
    title: "Optimizer",
    value: "Adam",
    description: "Adaptive learning rate with β₁=0.9, β₂=0.999",
  },
  {
    icon: Target,
    title: "Loss Function",
    value: "Categorical Cross-Entropy",
    description: "Standard loss for multi-class classification",
  },
  {
    icon: Activity,
    title: "Epochs",
    value: "5",
    description: "With early stopping on validation loss",
  },
  {
    icon: Award,
    title: "Best Val Accuracy",
    value: "98.90%",
    description: "Achieved on the held-out 20% test set",
  },
];

const FAQS = [
  {
    question: "Why use a CNN instead of a simple neural network?",
    answer:
      "Convolutional layers preserve spatial relationships between pixels, making them ideal for image data. A plain dense network would flatten 28×28 images into 784 inputs, losing 2D structure. The CNN's filters detect edges, curves, and shapes hierarchically.",
  },
  {
    question: "Why two convolutional blocks?",
    answer:
      "The first block learns low-level features (edges, curves). The second block learns higher-level patterns (loops, intersections). More blocks would risk overfitting on the relatively simple MNIST dataset.",
  },
  {
    question: "What does dropout do?",
    answer:
      "Dropout randomly disables 50% of neurons during training, forcing the network to learn redundant representations. This prevents overfitting and improves generalization on unseen data.",
  },
  {
    question: "How was the data split?",
    answer:
      "We used an 80/20 split: 42,000 samples for training and the remaining samples for validation. The test split was stratified to preserve class balance across digits 0–9.",
  },
];

export default function AboutPageWrapper() {
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const trainingRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const authorRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (typeof window === "undefined" || !pageRef.current) return;

    const ctx = gsap.context(() => {
      // Hero
      if (heroRef.current) {
        gsap.from(heroRef.current.children, {
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.12,
          ease: "power3.out",
          clearProps: "all",
        });
      }

      // Hero parallax
      const heroBg = pageRef.current?.querySelector(".hero-parallax");
      if (heroBg && window.innerWidth >= 768) {
        gsap.to(heroBg, {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: heroBg,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // Stats
      if (statsRef.current) {
        gsap.from(statsRef.current.children, {
          y: 40,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 92%",
            once: true,
          },
        });
      }

      // Metric bars
      if (metricsRef.current) {
        const bars =
          metricsRef.current.querySelectorAll<HTMLElement>(".metric-bar-fill");
        bars.forEach((bar) => {
          const target = bar.getAttribute("data-value") || "0";
          gsap.fromTo(
            bar,
            { width: "0%" },
            {
              width: `${target}%`,
              duration: 1.4,
              ease: "power3.out",
              scrollTrigger: { trigger: bar, start: "top 90%", once: true },
            },
          );
        });
      }

      // Sections
      if (sectionsRef.current) {
        Array.from(sectionsRef.current.children).forEach((child) => {
          gsap.from(child, {
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            clearProps: "all",
            scrollTrigger: { trigger: child, start: "top 92%", once: true },
          });
        });
      }

      // Training
      if (trainingRef.current) {
        gsap.from(trainingRef.current.children, {
          y: 40,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: trainingRef.current,
            start: "top 92%",
            once: true,
          },
        });
      }

      // FAQ
      if (faqRef.current) {
        gsap.from(faqRef.current.children, {
          y: 40,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: faqRef.current,
            start: "top 92%",
            once: true,
          },
        });
      }

      // Author
      if (authorRef.current) {
        gsap.from(authorRef.current, {
          scale: 0.95,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: authorRef.current,
            start: "top 92%",
            once: true,
          },
        });
      }

      // CTA
      if (ctaRef.current) {
        gsap.from(ctaRef.current, {
          scale: 0.95,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 92%",
            once: true,
          },
        });
      }

      // Pulse stat icons
      gsap.to(".stat-icon", {
        boxShadow: "0 0 24px 4px rgba(139, 92, 246, 0.4)",
        repeat: -1,
        yoyo: true,
        duration: 2,
        ease: "sine.inOut",
        stagger: 0.3,
      });
    }, pageRef);

    const t = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => {
      clearTimeout(t);
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={pageRef}
      className="relative mx-auto w-full max-w-6xl overflow-x-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
    >
      {/* HERO BACKGROUND (parallax) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[700px] overflow-hidden"
      >
        <div className="hero-parallax absolute inset-0">
          <Image
            src="/hero-bg.png"
            alt=""
            fill
            priority
            className="object-cover opacity-[0.25] mix-blend-screen"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-950/70 to-neutral-950" />
      </div>

      {/* HERO */}
      <div ref={heroRef} className="mb-10 mt-5 flex flex-col justify-center items-center sm:mb-14">
        <Badge
          variant="outline"
          className="mb-4 border-violet-500/40 bg-violet-500/10 px-3 py-1 text-[11px] text-violet-300 sm:mb-5 sm:text-xs"
        >
          <Brain className="mr-1.5 h-3 w-3" />
          Model Documentation
        </Badge>
        <h1 className="gradient-text text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
          About the Model
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-neutral-400 sm:mt-5 sm:text-base">
          A deep dive into the Convolutional Neural Network powering this digit <br />
          recognizer — its architecture, the dataset it was trained on, and how
          it achieves{" "}
          <span className="font-semibold text-violet-300">
            98.90% test accuracy
          </span>
          .
        </p>
      </div>

      {/* STATS */}
      <div
        ref={statsRef}
        className="mb-10 grid grid-cols-2 gap-3 sm:mb-14 sm:gap-4 md:grid-cols-4"
      >
        {MODEL_STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="glass-card relative overflow-hidden border-neutral-800/60 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/10"
            >
              <div
                aria-hidden
                className="absolute inset-0 -z-10 opacity-[0.06]"
              >
                <Image
                  src="/step-draw.png"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="300px"
                />
              </div>

              <CardContent className="flex flex-col items-center gap-2 p-4 text-center sm:p-6">
                <div className="stat-icon flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                  <Icon className="h-5 w-5 text-violet-400" />
                </div>
                <p className="font-mono text-lg font-bold text-neutral-100 sm:text-xl lg:text-2xl">
                  {stat.value}
                </p>
                <p className="text-[9px] font-medium uppercase tracking-[0.15em] text-neutral-500 sm:text-[10px]">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* PERFORMANCE METRICS */}
      <div className="mb-10 sm:mb-14">
        <div className="mb-6 text-center sm:mb-8">
          <Badge
            variant="outline"
            className="mb-3 border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-1 text-[11px] text-fuchsia-300 sm:text-xs"
          >
            <BarChart3 className="mr-1.5 h-3 w-3" />
            Performance Metrics
          </Badge>
          <h2 className="text-xl font-bold tracking-tight text-neutral-100 sm:text-2xl lg:text-3xl">
            Benchmark results
          </h2>
        </div>

        {/* NEW CARD */}
        <Card className="glass-card relative overflow-hidden border-neutral-800/60">
          {/* Gradient border glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 rounded-2xl p-[1px] [background:linear-gradient(135deg,rgba(139,92,246,0.4),rgba(99,102,241,0.15),rgba(217,70,239,0.3))] [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]"
          />

          {/* Faint bg image */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 opacity-[0.12] mix-blend-screen"
          >
            <Image
              src="/feature-accuracy.png"
              alt=""
              fill
              className="object-cover"
              sizes="1200px"
            />
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-neutral-950/75 via-neutral-950/50 to-neutral-950/85" />

          {/* Animated scanline */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="metric-scanline absolute -top-full left-0 h-[200%] w-px bg-gradient-to-b from-transparent via-violet-400/60 to-transparent" />
          </div>

          <CardContent
            ref={metricsRef}
            className="relative flex flex-col gap-7 p-5 sm:p-7 lg:p-9"
          >
            {METRICS.map((metric, i) => (
              <div
                key={metric.label}
                className="metric-row group flex items-center gap-4 sm:gap-6"
              >
                {/* Circular ring */}
                <div className="relative h-14 w-14 shrink-0 sm:h-16 sm:w-16">
                  <svg
                    viewBox="0 0 36 36"
                    className="h-full w-full -rotate-90 transform"
                  >
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9155"
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="2.5"
                    />
                    <circle
                      className="metric-ring-fill"
                      cx="18"
                      cy="18"
                      r="15.9155"
                      fill="none"
                      stroke="url(#ringGradient)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="100"
                      strokeDashoffset="100"
                      data-value={metric.value}
                      style={{
                        filter: "drop-shadow(0 0 6px rgba(139,92,246,0.7))",
                      }}
                    />
                    <defs>
                      <linearGradient
                        id="ringGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#a78bfa" />
                        <stop offset="50%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#e879f9" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="metric-counter font-mono text-[10px] font-bold text-violet-200 sm:text-xs"
                      data-value={metric.value}
                    >
                      0%
                    </span>
                  </div>
                </div>

                {/* Right side: label + segmented bars */}
                <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-xs font-medium tracking-tight text-neutral-200 sm:text-sm">
                      {metric.label}
                    </span>
                    <span className="metric-counter ml-2 shrink-0 font-mono text-xs font-bold text-violet-200 sm:text-sm">
                      {metric.value}%
                    </span>
                  </div>

                  {/* Segmented bar */}
                  <div className="relative flex gap-[3px]">
                    {Array.from({ length: 40 }).map((_, segIdx) => {
                      const fillUpTo = (metric.value / 100) * 40;
                      const isFilled = segIdx < fillUpTo;
                      const isEdge = Math.abs(segIdx - fillUpTo) < 1;

                      return (
                        <div
                          key={segIdx}
                          className={`metric-segment h-1.5 flex-1 rounded-[2px] transition-all duration-300 ${
                            isFilled
                              ? `bg-gradient-to-r ${metric.color} shadow-[0_0_6px_rgba(139,92,246,0.6)]`
                              : "bg-white/5"
                          } ${isEdge ? "ring-1 ring-violet-400/50" : ""}`}
                          style={{
                            transitionDelay: `${segIdx * 15}ms`,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ARCHITECTURE + DATASET */}
      <div
        ref={sectionsRef}
        className="mb-10 grid gap-5 sm:mb-14 sm:gap-6 lg:grid-cols-2"
      >
        {/* Architecture */}
        <Card className="glass-card relative overflow-hidden border-neutral-800/60">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 opacity-[0.08] mix-blend-screen"
          >
            <Image
              src="/step-cnn.png"
              alt=""
              fill
              className="object-cover"
              sizes="600px"
            />
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-neutral-950/80 via-neutral-950/50 to-neutral-950/90" />

          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-neutral-200 sm:text-lg">
              <Layers className="h-5 w-5 text-violet-400" />
              Model Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {ARCHITECTURE.map((layer, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 rounded-lg border border-neutral-800/80 bg-neutral-950/70 px-3 py-2.5 backdrop-blur-sm transition-colors hover:border-violet-500/30 hover:bg-violet-500/10 sm:px-4"
                >
                  <span className="font-mono text-xs text-violet-300 sm:text-sm">
                    {layer.layer}
                  </span>
                  <span className="text-right text-[10px] text-neutral-400 sm:text-xs">
                    {layer.detail}
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Dataset + API */}
        <div className="space-y-5 sm:space-y-6">
          <Card className="glass-card relative overflow-hidden border-neutral-800/60">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 opacity-[0.08] mix-blend-screen"
            >
              <Image
                src="/step-draw.png"
                alt=""
                fill
                className="object-cover"
                sizes="600px"
              />
            </div>
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-neutral-950/85 via-neutral-950/55 to-neutral-950/90" />

            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-neutral-200 sm:text-lg">
                <Database className="h-5 w-5 text-indigo-400" />
                Dataset
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-neutral-200">
                  MNIST Handwritten Digits
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">
                  A classic benchmark dataset containing grayscale images of
                  handwritten digits (0–9). We trained on{" "}
                  <span className="font-mono text-violet-300">42,000</span>{" "}
                  samples and validated on the remaining{" "}
                  <span className="font-mono text-violet-300">20%</span>.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="border-neutral-700 bg-neutral-900/60 text-[10px] text-neutral-400 sm:text-xs"
                >
                  42k training
                </Badge>
                <Badge
                  variant="outline"
                  className="border-neutral-700 bg-neutral-900/60 text-[10px] text-neutral-400 sm:text-xs"
                >
                  20% test
                </Badge>
                <Badge
                  variant="outline"
                  className="border-neutral-700 bg-neutral-900/60 text-[10px] text-neutral-400 sm:text-xs"
                >
                  28×28 pixels
                </Badge>
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 bg-emerald-500/10 text-[10px] text-emerald-300 sm:text-xs"
                >
                  <TrendingUp className="mr-1 h-3 w-3" />
                  98.90% accuracy
                </Badge>
              </div>

              <a
                href="https://www.kaggle.com/code/prashant111/mnist-deep-neural-network-with-keras/input?select=test.csv"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full border-neutral-700/80 bg-neutral-900/60 text-sm text-neutral-300 transition-all hover:-translate-y-0.5 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-200"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Dataset on Kaggle
                </Button>
              </a>
            </CardContent>
          </Card>

          <Card className="glass-card relative overflow-hidden border-neutral-800/60">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 opacity-[0.07] mix-blend-screen"
            >
              <Image
                src="/step-predict.png"
                alt=""
                fill
                className="object-cover"
                sizes="600px"
              />
            </div>
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-neutral-950/85 via-neutral-950/55 to-neutral-950/90" />

            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-neutral-200 sm:text-lg">
                <Code2 className="h-5 w-5 text-emerald-400" />
                API Endpoint
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-neutral-800/80 bg-neutral-950/70 p-3.5 backdrop-blur-sm">
                <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500">
                  Base URL
                </p>
                <code className="mt-1 block break-all font-mono text-xs text-emerald-300 sm:text-sm">
                  https://ai-powered-number-classifier-ovuw.onrender.com/
                </code>
              </div>
              <div className="flex items-start gap-2 text-xs text-neutral-400">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>
                  POST{" "}
                  <code className="font-mono text-neutral-300">/predict</code> —
                  PNG · JPEG · WebP (max 5MB)
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs text-neutral-400">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span>
                  GET <code className="font-mono text-neutral-300">/</code> —
                  health check
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* TRAINING DETAILS */}
      <div className="mb-10 sm:mb-14">
        <div className="mb-6 text-center sm:mb-8">
          <Badge
            variant="outline"
            className="mb-3 border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[11px] text-amber-300 sm:text-xs"
          >
            <BookOpen className="mr-1.5 h-3 w-3" />
            Training Details
          </Badge>
          <h2 className="text-xl font-bold tracking-tight text-neutral-100 sm:text-2xl lg:text-3xl">
            How the model was trained
          </h2>
        </div>

        <div
          ref={trainingRef}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4"
        >
          {TRAINING_DETAILS.map((detail) => {
            const Icon = detail.icon;
            return (
              <Card
                key={detail.title}
                className="glass-card relative overflow-hidden border-neutral-800/60 transition-all hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10"
              >
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 opacity-[0.08] mix-blend-screen"
                >
                  <Image
                    src="/step-predict.png"
                    alt=""
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                </div>
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-neutral-950/90 via-neutral-950/70 to-neutral-950/95" />

                <CardContent className="flex flex-col gap-3 p-5 sm:p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                    <Icon className="h-5 w-5 text-violet-400" />
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500">
                    {detail.title}
                  </p>
                  <p className="text-sm font-semibold text-neutral-100 sm:text-base">
                    {detail.value}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {detail.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-10 sm:mb-14">
        <div className="mb-8 text-center sm:mb-12">
          <Badge
            variant="outline"
            className="mb-3 border-blue-500/40 bg-blue-500/10 px-3 py-1 text-[11px] text-blue-300 sm:text-xs"
          >
            <Activity className="mr-1.5 h-3 w-3" />
            FAQ
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-100 sm:text-3xl lg:text-4xl">
            Design decisions explained
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-xs text-neutral-400 sm:text-sm">
            Deep dives into the architectural and training choices behind the
            model.
          </p>
        </div>

        <div ref={faqRef} className="grid gap-4 lg:grid-cols-2">
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;

            return (
              <Card
                key={i}
                className={`glass-card group relative overflow-hidden border transition-all duration-500 ${
                  isOpen
                    ? "border-violet-500/40 shadow-xl shadow-violet-500/10"
                    : "border-neutral-800/60 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5"
                }`}
              >
                {/* Left accent bar */}
                <div
                  className={`absolute top-0 left-0 h-full w-[3px] transition-all duration-500 ${
                    isOpen
                      ? "bg-gradient-to-b from-violet-500 via-indigo-500 to-fuchsia-500 shadow-[0_0_12px_rgba(139,92,246,0.6)]"
                      : "bg-neutral-800 group-hover:bg-violet-500/40"
                  }`}
                />

                {/* Faint glow behind when open */}
                {isOpen && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-violet-600/10 blur-3xl"
                  />
                )}

                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="relative flex w-full items-start justify-between gap-4 p-5 text-left sm:p-6"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                    {/* Number badge */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold transition-all duration-300 sm:h-9 sm:w-9 sm:text-sm ${
                        isOpen
                          ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/40"
                          : "bg-neutral-900/80 text-neutral-500 group-hover:text-violet-300"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>

                    <div className="flex flex-col gap-1 pt-0.5">
                      <span
                        className={`text-sm font-semibold tracking-tight transition-colors sm:text-base ${
                          isOpen
                            ? "text-violet-100"
                            : "text-neutral-100 group-hover:text-violet-200"
                        }`}
                      >
                        {faq.question}
                      </span>
                      {!isOpen && (
                        <span className="text-[10px] text-neutral-500 sm:text-xs">
                          Click to reveal
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Chevron */}
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      isOpen
                        ? "rotate-180 border-violet-500/50 bg-violet-500/20 text-violet-200"
                        : "border-neutral-700/60 bg-neutral-900/60 text-neutral-500 group-hover:border-violet-500/30 group-hover:text-violet-300"
                    }`}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </div>
                </button>

                {/* Answer */}
                <div
                  className={`grid overflow-hidden transition-all duration-500 ease-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-neutral-800/60 px-5 pt-4 pb-5 sm:px-6 sm:pb-6">
                      <p className="pl-11 text-xs leading-relaxed text-neutral-400 sm:pl-13 sm:text-sm">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Still have questions? footer */}
        <div className="mt-8 flex justify-center sm:mt-10">
          <a
            href="https://github.com/Sheharyar-Sarmad/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-full border border-neutral-800/80 bg-neutral-900/60 px-5 py-2.5 text-xs text-neutral-400 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-200 sm:text-sm"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20">
              <ExternalLink className="h-2.5 w-2.5 text-violet-400" />
            </div>
            Still have questions? Open an issue on GitHub
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>

      {/* AUTHOR  */}
      <div ref={authorRef} className="mb-10 sm:mb-14">
        <Card className="glass-card relative overflow-hidden border-neutral-800/60">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 opacity-[0.12] mix-blend-screen"
          >
            <Image
              src="/step-cnn.png"
              alt=""
              fill
              className="object-cover"
              sizes="1200px"
            />
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-neutral-950/85 via-neutral-950/60 to-neutral-950/95" />

          <CardContent className="flex flex-col items-center gap-5 px-4 py-8 text-center sm:px-6 sm:py-10">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 opacity-50 blur-2xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 shadow-2xl shadow-violet-600/30 sm:h-20 sm:w-20">
                <Brain className="h-7 w-7 text-white sm:h-9 sm:w-9" />
              </div>
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-neutral-100 sm:text-xl">
                Sheharyar Sarmad
              </p>
              <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
                AI & Deep Learning Engineer
              </p>
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:gap-3">
              <a
                href="https://github.com/Sheharyar-Sarmad/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="border-neutral-700/80 bg-neutral-900/60 text-xs text-neutral-300 transition-all hover:-translate-y-0.5 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-200 sm:text-sm"
                >
                  <FaGithub className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </a>
              <a
                href="https://www.linkedin.com/in/sheharyar-sarmad-9b7736289/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="border-neutral-700/80 bg-neutral-900/60 text-xs text-neutral-300 transition-all hover:-translate-y-0.5 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-200 sm:text-sm"
                >
                  <FaLinkedin className="mr-2 h-4 w-4" />
                  LinkedIn
                </Button>
              </a>
              <a
                href="https://github.com/Sheharyar-Sarmad/AI-Powered-Number-Classifier"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="sm"
                  className="group relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 text-xs text-white shadow-lg shadow-violet-600/30 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-violet-500/50 sm:text-sm"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <FaGithub className="mr-2 h-4 w-4" />
                  View Repository
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <div ref={ctaRef}>
        <Card className="glass-card relative overflow-hidden rounded-2xl border border-violet-500/30 sm:rounded-3xl">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 opacity-40 mix-blend-screen"
          >
            <Image
              src="/cta-bg.png"
              alt=""
              fill
              className="object-cover"
              sizes="1200px"
            />
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-neutral-950/85 via-neutral-950/70 to-neutral-950/95" />

          <CardContent className="flex flex-col items-center gap-4 px-6 py-10 text-center sm:px-10 sm:py-14">
            <Badge
              variant="outline"
              className="border-violet-500/40 bg-violet-500/10 px-3 py-1 text-[11px] text-violet-300 sm:text-xs"
            >
              <Sparkles className="mr-1.5 h-3 w-3" />
              Ready to try it?
            </Badge>
            <h2 className="gradient-text mx-auto max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Draw your own digit
            </h2>
            <p className="mx-auto max-w-lg text-xs text-neutral-400 sm:text-sm">
              Test the model with your own handwriting in the Prediction Lab.
            </p>
            <a href="/prediction-lab">
              <Button className="group relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-violet-500/50">
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <Brain className="mr-2 h-4 w-4" />
                Open Prediction Lab
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
