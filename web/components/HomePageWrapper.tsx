"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Brain,
  ArrowRight,
  Play,
  Zap,
  Gauge,
  Shield,
  Cpu,
  Clock,
  Layers,
  ExternalLink,
  ChevronDown,
  Activity,
  BookOpen,
  Code2,
  Rocket,
  Target,
  BarChart3,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// DATA
const STATS = [
  { label: "Test Accuracy", value: "98.90%", href: "/about", external: false },
  {
    label: "Training Samples",
    value: "42,000",
    href: "https://www.kaggle.com/datasets/hojjatk/mnist-dataset",
    external: true,
  },
  { label: "Test Split", value: "20%", href: "/about", external: false },
  {
    label: "Inference Time",
    value: "<100ms",
    href: "https://fastapi.tiangolo.com/",
    external: true,
  },
];

const STEPS = [
  {
    number: "01",
    title: "Draw a digit",
    description: "Sketch any digit from 0 to 9 on the canvas.",
    href: "/prediction-lab",
    external: false,
  },
  {
    number: "02",
    title: "Send to CNN",
    description: "The canvas is normalized and sent to our FastAPI endpoint.",
    href: "https://www.tensorflow.org/",
    external: true,
  },
  {
    number: "03",
    title: "Get prediction",
    description: "The CNN returns probabilities visualized as a bar chart.",
    href: "/prediction-lab",
    external: false,
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Real-time Inference",
    description:
      "Predictions served in under 100ms via an optimized FastAPI backend.",
    href: "https://fastapi.tiangolo.com/",
    external: true,
  },
  {
    icon: Gauge,
    title: "98.90% Accuracy",
    description: "Trained on 42,000 MNIST samples with dropout regularization.",
    href: "/about",
    external: false,
  },
  {
    icon: Shield,
    title: "Strict Validation",
    description: "MIME type, extension, and size checks on every upload.",
    href: "/about",
    external: false,
  },
  {
    icon: Cpu,
    title: "TensorFlow Powered",
    description: "A production-grade Keras model served via FastAPI.",
    href: "https://www.tensorflow.org/",
    external: true,
  },
  {
    icon: Clock,
    title: "Instant Feedback",
    description: "A live probability chart for every digit, every prediction.",
    href: "/prediction-lab",
    external: false,
  },
  {
    icon: Layers,
    title: "Deep CNN Architecture",
    description:
      "Two convolutional blocks, dense layers, and a softmax classifier.",
    href: "/about",
    external: false,
  },
];

const TECH_STACK = [
  { name: "TensorFlow", href: "https://www.tensorflow.org/" },
  { name: "Keras", href: "https://keras.io/" },
  { name: "FastAPI", href: "https://fastapi.tiangolo.com/" },
  { name: "Next.js", href: "https://nextjs.org/" },
  { name: "React", href: "https://react.dev/" },
  { name: "TypeScript", href: "https://www.typescriptlang.org/" },
  { name: "Tailwind CSS", href: "https://tailwindcss.com/" },
  { name: "NumPy", href: "https://numpy.org/" },
  { name: "Pillow", href: "https://python-pillow.org/" },
  { name: "Uvicorn", href: "https://www.uvicorn.org/" },
  { name: "Pydantic", href: "https://docs.pydantic.dev/" },
  { name: "GSAP", href: "https://gsap.com/" },
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

const FAQS = [
  {
    question: "What dataset was used to train this model?",
    answer:
      "The model was trained on the MNIST handwritten digits dataset — 42,000 training samples with a 20% validation split. MNIST is a benchmark dataset containing 28×28 grayscale images of digits from 0 to 9.",
  },
  {
    question: "How does the prediction work?",
    answer:
      "When you draw a digit on the canvas, it's converted to a PNG, sent to our FastAPI backend, normalized to 28×28 pixels, and passed through the Convolutional Neural Network. The CNN outputs a probability for each digit (0–9).",
  },
  {
    question: "What is the model's accuracy?",
    answer:
      "The model achieves 98.90% test accuracy on a held-out validation set. This means it correctly identifies roughly 99 out of every 100 handwritten digits.",
  },
  {
    question: "Can I use this model in production?",
    answer:
      "Yes. The entire stack — TensorFlow, FastAPI, and Next.js — is production-ready. Just deploy the FastAPI backend to any cloud provider and update the NEXT_PUBLIC_API_URL environment variable.",
  },
];

const EXPLORE_LINKS = [
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Read the architecture and API reference.",
    href: "/about",
    external: false,
  },
  {
    icon: Code2,
    title: "GitHub Repository",
    description: "View the source code on GitHub.",
    href: "https://github.com/Sheharyar-Sarmad/",
    external: true,
  },
  {
    icon: Rocket,
    title: "Prediction Lab",
    description: "Try the model with your own handwriting.",
    href: "/prediction-lab",
    external: false,
  },
  {
    icon: Target,
    title: "Training Notebook",
    description: "Explore the MNIST training notebook.",
    href: "https://www.kaggle.com/code/prashant111/mnist-deep-neural-network-with-keras",
    external: true,
  },
];

// COMPONENT
export default function HomePageWrapper() {
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);
  const techTrackRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (typeof window === "undefined" || !pageRef.current) return;

    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.from(heroRef.current.children, {
          y: 40,
          opacity: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          clearProps: "all",
        });
      }

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

      if (stepsRef.current) {
        const cards = Array.from(stepsRef.current.children);
        cards.forEach((card, i) => {
          gsap.from(card, {
            x: i % 2 === 0 ? -60 : 60,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            clearProps: "all",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              once: true,
            },
          });
        });
      }

      if (featuresRef.current) {
        gsap.from(featuresRef.current.children, {
          y: 60,
          opacity: 0,
          scale: 0.9,
          rotate: -2,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 90%",
            once: true,
          },
        });
      }

      // Metrics: bars + rings + counters
      if (metricsRef.current) {
        // Segments
        const segments = metricsRef.current.querySelectorAll(".metric-segment");
        segments.forEach((seg, i) => {
          gsap.from(seg, {
            scaleX: 0,
            opacity: 0,
            duration: 0.3,
            delay: (i % 40) * 0.015,
            ease: "power2.out",
            transformOrigin: "left center",
            scrollTrigger: {
              trigger: metricsRef.current,
              start: "top 85%",
              once: true,
            },
          });
        });

        // Rings
        const rings =
          metricsRef.current.querySelectorAll<SVGCircleElement>(
            ".metric-ring-fill",
          );
        rings.forEach((ring) => {
          const target = parseFloat(ring.getAttribute("data-value") || "0");
          const offset = 100 - (target / 100) * 100;
          gsap.to(ring, {
            strokeDashoffset: offset,
            duration: 1.6,
            ease: "power3.out",
            scrollTrigger: {
              trigger: metricsRef.current,
              start: "top 85%",
              once: true,
            },
          });
        });

        // Counters
        const counters =
          metricsRef.current.querySelectorAll<HTMLElement>(".metric-counter");
        counters.forEach((counter) => {
          const target = parseFloat(counter.getAttribute("data-value") || "0");
          gsap.fromTo(
            counter,
            { innerText: 0 },
            {
              innerText: target,
              duration: 1.6,
              ease: "power3.out",
              snap: { innerText: 0.1 },
              scrollTrigger: {
                trigger: metricsRef.current,
                start: "top 85%",
                once: true,
              },
              onUpdate: function () {
                counter.innerText = `${parseFloat(counter.innerText).toFixed(1)}%`;
              },
            },
          );
        });

        // Scanline
        const scanline = metricsRef.current.querySelector(".metric-scanline");
        if (scanline) {
          gsap.fromTo(
            scanline,
            { x: 0 },
            {
              x: metricsRef.current.clientWidth,
              duration: 3,
              repeat: -1,
              ease: "power1.inOut",
              repeatDelay: 2,
            },
          );
        }
      }

      // FAQ
      if (faqRef.current) {
        gsap.from(faqRef.current.children, {
          y: 40,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: faqRef.current,
            start: "top 90%",
            once: true,
          },
        });
      }

      // Explore
      if (exploreRef.current) {
        gsap.from(exploreRef.current.children, {
          y: 50,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: exploreRef.current,
            start: "top 90%",
            once: true,
          },
        });
      }

      // Tech marquee
      if (techTrackRef.current) {
        const speed = window.innerWidth < 640 ? 45 : 30;
        gsap.to(techTrackRef.current, {
          xPercent: -50,
          repeat: -1,
          duration: speed,
          ease: "linear",
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
            start: "top 88%",
            once: true,
          },
        });
      }
    }, pageRef);

    const t = setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => {
      clearTimeout(t);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={pageRef} className="relative w-full overflow-x-hidden">
      {/* HERO  */}
      <section className="relative mx-auto flex h-screen max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
        <div
          ref={heroRef}
          className="flex w-full flex-col items-center text-center"
        >
          <Badge
            variant="outline"
            className="mt-12 mb-5 inline-flex items-center gap-1.5 border-violet-500/40 bg-violet-500/10 px-3 py-1 text-[11px] text-violet-300 sm:mt-0 sm:text-xs"
          >
            <Sparkles className="h-3 w-3 shrink-0" />
            CNN · TensorFlow · FastAPI · Next.js
          </Badge>
          <h1 className="gradient-text mx-auto max-w-3xl text-4xl leading-tight font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Recognize handwritten digits in real-time
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-neutral-400 sm:mt-6 sm:text-base lg:text-lg">
            A deep learning playground built with a Convolutional Neural Network
            trained on{" "}
            <span className="font-semibold text-violet-300">
              42,000 MNIST samples
            </span>{" "}
            achieving{" "}
            <span className="font-semibold text-violet-300">
              98.90% test accuracy
            </span>
            .
          </p>

          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:gap-4">
            <Link href="/prediction-lab" className="w-full sm:w-auto">
              <button className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-violet-500/50 sm:w-auto">
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <Play className="h-4 w-4" />
                Try the Prediction Lab
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>

            <a
              href="https://github.com/Sheharyar-Sarmad/AI-Powered-Number-Classifier"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-700/80 bg-neutral-900/60 px-6 py-3.5 text-sm font-medium text-neutral-300 transition-all hover:-translate-y-0.5 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-200 sm:w-auto"
            >
              <FaGithub className="h-4 w-4" />
              View on GitHub
            </a>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="h-5 w-5 text-neutral-600" />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div
          ref={statsRef}
          className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4"
        >
          {STATS.map((stat) => {
            const CardWrapper = stat.external ? "a" : Link;
            const extraProps = stat.external
              ? {
                  href: stat.href,
                  target: "_blank",
                  rel: "noopener noreferrer",
                }
              : { href: stat.href };

            return (
              <CardWrapper key={stat.label} {...(extraProps as any)}>
                <div className="glass-card group relative h-full rounded-2xl border border-neutral-800/60 p-4 text-center transition-all hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10 sm:p-6">
                  <p className="font-mono text-xl font-bold text-neutral-100 transition-colors group-hover:text-violet-200 sm:text-2xl lg:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.15em] text-neutral-500 sm:text-[10px]">
                    {stat.label}
                  </p>
                  <ExternalLink className="absolute top-3 right-3 h-3 w-3 text-neutral-700 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </CardWrapper>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-8 text-center sm:mb-12">
          <Badge
            variant="outline"
            className="mb-3 border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-[11px] text-indigo-300 sm:mb-4 sm:text-xs"
          >
            How It Works
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-100 sm:text-3xl lg:text-4xl">
            Three simple steps
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-neutral-400 sm:mt-3 sm:text-sm">
            From your sketch to a prediction in under a second.
          </p>
        </div>

        <div
          ref={stepsRef}
          className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3 lg:gap-8"
        >
          {STEPS.map((step) => {
            const CardWrapper = step.external ? "a" : Link;
            const extraProps = step.external
              ? {
                  href: step.href,
                  target: "_blank",
                  rel: "noopener noreferrer",
                }
              : { href: step.href };

            return (
              <CardWrapper
                key={step.number}
                {...(extraProps as any)}
                className="block"
              >
                <Card className="glass-card group h-full overflow-hidden border-neutral-800/60 transition-all hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/10">
                  <CardContent className="flex flex-col gap-4 p-6 sm:p-8">
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-600/10 transition-transform group-hover:scale-110">
                        <span className="font-mono text-lg font-bold text-violet-300">
                          {step.number}
                        </span>
                      </div>
                      {step.external && (
                        <ExternalLink className="h-4 w-4 text-neutral-600" />
                      )}
                    </div>

                    <h3 className="flex items-center gap-2 text-lg font-semibold text-neutral-100 transition-colors group-hover:text-violet-200 sm:text-xl">
                      {step.title}
                    </h3>
                    <p className="text-sm text-neutral-400">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </CardWrapper>
            );
          })}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-8 text-center sm:mb-12">
          <Badge
            variant="outline"
            className="mb-3 border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-300 sm:mb-4 sm:text-xs"
          >
            Features
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-100 sm:text-3xl lg:text-4xl">
            Built for speed and reliability
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-neutral-400 sm:mt-3 sm:text-sm">
            Every layer of the stack is optimized for real-time inference.
          </p>
        </div>

        <div
          ref={featuresRef}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            const CardWrapper = feature.external ? "a" : Link;
            const extraProps = feature.external
              ? {
                  href: feature.href,
                  target: "_blank",
                  rel: "noopener noreferrer",
                }
              : { href: feature.href };

            return (
              <CardWrapper
                key={feature.title}
                {...(extraProps as any)}
                className="block"
              >
                <Card className="glass-card group relative h-full overflow-hidden border-neutral-800/60 transition-all hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/10">
                  <CardContent className="flex flex-col gap-3 p-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 transition-all group-hover:bg-violet-500/20 sm:h-11 sm:w-11">
                        <Icon className="h-4 w-4 text-violet-400 sm:h-5 sm:w-5" />
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-neutral-700 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-100 transition-colors group-hover:text-violet-200 sm:text-base">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-neutral-400 sm:text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </CardWrapper>
            );
          })}
        </div>
      </section>

      {/* PERFORMANCE METRICS */}
      <div className="mb-10 sm:mb-14 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

        <Card className="glass-card relative overflow-hidden border-neutral-800/60">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 rounded-2xl p-[1px] [background:linear-gradient(135deg,rgba(139,92,246,0.4),rgba(99,102,241,0.15),rgba(217,70,239,0.3))] [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]"
          />

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
            {METRICS.map((metric) => (
              <div
                key={metric.label}
                className="metric-row group flex items-center gap-4 sm:gap-6"
              >
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

                <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-xs font-medium tracking-tight text-neutral-200 sm:text-sm">
                      {metric.label}
                    </span>
                    <span className="metric-counter ml-2 shrink-0 font-mono text-xs font-bold text-violet-200 sm:text-sm">
                      {metric.value}%
                    </span>
                  </div>

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
                          style={{ transitionDelay: `${segIdx * 15}ms` }}
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

      {/* TECH MARQUEE */}
      <section className="w-full overflow-hidden py-14 sm:py-20">
        <div className="mb-8 text-center sm:mb-10">
          <Badge
            variant="outline"
            className="mb-3 border-neutral-700 bg-neutral-900/60 px-3 py-1 text-[11px] text-neutral-400 sm:mb-4 sm:text-xs"
          >
            Tech Stack
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-100 sm:text-3xl lg:text-4xl">
            Powered by modern tools
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-neutral-400 sm:mt-3 sm:text-sm">
            Click any technology to visit its official docs.
          </p>
        </div>

        <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div
            ref={techTrackRef}
            className="flex shrink-0 items-center gap-3 pr-3 sm:gap-4 sm:pr-4"
          >
            {[...TECH_STACK, ...TECH_STACK].map((tech, i) => (
              <a
                key={i}
                href={tech.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-2 rounded-full border border-neutral-800/80 bg-neutral-900/60 px-4 py-2 font-mono text-xs text-neutral-300 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-200 sm:px-5 sm:py-2.5 sm:text-sm"
              >
                {tech.name}
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-8 text-center sm:mb-12">
          <Badge
            variant="outline"
            className="mb-3 border-blue-500/40 bg-blue-500/10 px-3 py-1 text-[11px] text-blue-300 sm:mb-4 sm:text-xs"
          >
            <Activity className="mr-1.5 h-3 w-3" />
            FAQ
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-100 sm:text-3xl lg:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-neutral-400 sm:mt-3 sm:text-sm">
            Everything you need to know about the model and its stack.
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
                <div
                  className={`absolute top-0 left-0 h-full w-[3px] transition-all duration-500 ${
                    isOpen
                      ? "bg-gradient-to-b from-violet-500 via-indigo-500 to-fuchsia-500 shadow-[0_0_12px_rgba(139,92,246,0.6)]"
                      : "bg-neutral-800 group-hover:bg-violet-500/40"
                  }`}
                />

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
      </section>

      {/* EXPLORE MORE */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-8 text-center sm:mb-12">
          <Badge
            variant="outline"
            className="mb-3 border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[11px] text-amber-300 sm:mb-4 sm:text-xs"
          >
            Explore More
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-100 sm:text-3xl lg:text-4xl">
            Dive deeper into the project
          </h2>
        </div>

        <div
          ref={exploreRef}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4"
        >
          {EXPLORE_LINKS.map((link) => {
            const Icon = link.icon;
            const CardWrapper = link.external ? "a" : Link;
            const extraProps = link.external
              ? {
                  href: link.href,
                  target: "_blank",
                  rel: "noopener noreferrer",
                }
              : { href: link.href };

            return (
              <CardWrapper
                key={link.title}
                {...(extraProps as any)}
                className="block"
              >
                <Card className="glass-card group h-full border-neutral-800/60 transition-all hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10">
                  <CardContent className="flex flex-col gap-3 p-5 sm:p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 transition-all group-hover:bg-violet-500/20">
                      <Icon className="h-5 w-5 text-violet-400" />
                    </div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-100 transition-colors group-hover:text-violet-200 sm:text-base">
                      {link.title}
                      {link.external && (
                        <ExternalLink className="h-3 w-3 text-neutral-600" />
                      )}
                    </h3>
                    <p className="text-xs text-neutral-400 sm:text-sm">
                      {link.description}
                    </p>
                  </CardContent>
                </Card>
              </CardWrapper>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div
          ref={ctaRef}
          className="glass-card relative overflow-hidden rounded-2xl border border-violet-500/30 p-6 text-center sm:rounded-3xl sm:p-10 lg:p-16"
        >
          <div className="relative">
            <Badge
              variant="outline"
              className="mb-4 border-violet-500/40 bg-violet-500/10 px-3 py-1 text-[11px] text-violet-300 sm:mb-5 sm:text-xs"
            >
              <Sparkles className="mr-1.5 h-3 w-3" />
              Ready to try it?
            </Badge>

            <h2 className="gradient-text mx-auto max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl xl:text-5xl">
              Draw your first digit now
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-xs text-neutral-400 sm:mt-4 sm:text-sm">
              Open the Prediction Lab, sketch a number on the canvas, and watch
              the CNN deliver its prediction in milliseconds.
            </p>

            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row">
              <Link href="/prediction-lab" className="w-full sm:w-auto">
                <button className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-violet-500/50 sm:w-auto">
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <Brain className="h-4 w-4" />
                  Open Prediction Lab
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>

              <a
                href="https://www.linkedin.com/in/sheharyar-sarmad-9b7736289/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-700/80 bg-neutral-900/60 px-6 py-3 text-sm font-medium text-neutral-300 transition-all hover:-translate-y-0.5 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-200 sm:w-auto"
              >
                Connect on LinkedIn
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
