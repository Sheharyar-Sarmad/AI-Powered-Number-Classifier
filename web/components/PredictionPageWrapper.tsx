"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import SignatureCanvas from "react-signature-canvas";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "sonner";
import { useDropzone } from "react-dropzone";
import {
  Eraser,
  Sparkles,
  LoaderCircle,
  RefreshCw,
  Brain,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Upload,
  Download,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  MessageSquare,
  X,
  Wand2,
  Bot,
  User as UserIcon,
  ChevronDown,
  Cpu,
  PenTool,
  FileDown,
  FileText,
  ImageDown,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import jsPDF from "jspdf";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ============ ENV ============
const GROQ_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || "";
const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_TTS_URL = "https://api.groq.com/openai/v1/audio/speech";
const GROQ_MODELS_URL = "https://api.groq.com/openai/v1/models";

const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const PREFERRED_MODEL = "llama-3.3-70b-versatile";
const TTS_MODEL = "playai-tts";
const TTS_VOICE = "Arista-PlayAI";

// ============ TYPES ============
interface PredictionResponse {
  predicted_digit: number;
  confidence: number;
  all_probabilities: number[];
  filename: string;
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
}

interface GroqModel {
  id: string;
  owned_by?: string;
  context_window?: number;
}

// ============ HELPERS ============
/**
 * Strip Qwen's chain-of-thought blocks and other internal tags
 * from LLM responses before rendering / speaking.
 */
const stripThinking = (text: string): string => {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s*\n+/, "")
    .trim();
};

// ============ COMPONENT ============
export default function PredictionPageWrapper() {
  const sigCanvasRef = useRef<SignatureCanvas | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasPanelRef = useRef<HTMLDivElement>(null);
  const resultPanelRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const pageGlowRef = useRef<HTMLDivElement>(null);

  const handleVoiceCommandRef = useRef<(text: string) => void>(() => {});
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // One-time guard for auto-reopen
  const hasAutoReopenedRef = useRef(false);

  // ============ STATE ============
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [micLevel, setMicLevel] = useState<number>(0);
  const [browserSupport, setBrowserSupport] = useState<{
    sr: boolean;
    mic: boolean;
  }>({ sr: false, mic: false });

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hey! I'm your AI assistant. Try saying 'draw a seven' or 'clear the canvas' — I can also predict and explain results.",
      timestamp: Date.now(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatStreaming, setIsChatStreaming] = useState(false);
  const [followUps, setFollowUps] = useState<string[]>([]);

  const [availableModels, setAvailableModels] = useState<GroqModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  // ============ BROWSER CAPABILITY ============
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setBrowserSupport({
      sr: !!SR,
      mic: !!navigator.mediaDevices?.getUserMedia,
    });
  }, []);

  // ============ FETCH GROQ MODELS ============
  useEffect(() => {
    if (!GROQ_KEY) return;
    let cancelled = false;

    (async () => {
      try {
        const { data } = await axios.get(GROQ_MODELS_URL, {
          headers: { Authorization: `Bearer ${GROQ_KEY}` },
        });
        if (cancelled) return;
        const chatModels: GroqModel[] = (data?.data || [])
          .filter(
            (m: GroqModel) =>
              !m.id.includes("whisper") &&
              !m.id.includes("tts") &&
              !m.id.includes("guard") &&
              !m.id.includes("vision")
          )
          .sort((a: GroqModel, b: GroqModel) => {
            // Push preferred model to the top
            if (a.id === PREFERRED_MODEL) return -1;
            if (b.id === PREFERRED_MODEL) return 1;
            return 0;
          });
        setAvailableModels(chatModels);
        if (!chatModels.find((m) => m.id === DEFAULT_MODEL) && chatModels[0]) {
          setSelectedModel(chatModels[0].id);
        }
      } catch (e: any) {
        console.warn("Failed to load Groq models:", e?.message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============ VOICE RECOGNITION SETUP ============
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.maxAlternatives = 1;

    rec.onresult = (e: any) => {
      const transcriptStr = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join("");
      const isFinal = e.results[e.results.length - 1].isFinal;

      setTranscript(transcriptStr);
      setChatInput(transcriptStr);

      if (isFinal) {
        handleVoiceCommandRef.current(transcriptStr.trim());
      }
    };

    rec.onerror = (e: any) => {
      const err = e.error;
      setIsListening(false);
      if (err === "not-allowed") {
        toast.error("Microphone blocked. Allow mic in browser settings.");
      } else if (err === "no-speech") {
        toast.warning("Didn't hear you. Speak right after clicking mic.");
      } else if (err === "network") {
        toast.error("Voice service unreachable. Check your internet.");
      } else if (err === "audio-capture") {
        toast.error("No microphone detected.");
      } else if (err !== "aborted") {
        toast.error(`Voice error: ${err}`);
      }
    };

    rec.onend = () => setIsListening(false);

    recognitionRef.current = rec;
  }, []);

  // ============ GSAP ENTRANCE ============
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(heroRef.current, {
        y: -40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
      gsap.from(canvasPanelRef.current, {
        x: -60,
        opacity: 0,
        duration: 0.9,
        delay: 0.2,
        ease: "power3.out",
      });
      gsap.from(resultPanelRef.current, {
        x: 60,
        opacity: 0,
        duration: 0.9,
        delay: 0.3,
        ease: "power3.out",
      });
    });
    return () => ctx.revert();
  }, []);

  // ============ GSAP BURST ============
  useEffect(() => {
    if (!result || !particlesRef.current || !pageGlowRef.current) return;
    const el = particlesRef.current;
    const glow = pageGlowRef.current;
    el.innerHTML = "";

    gsap.fromTo(
      glow,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" }
    );
    gsap.to(glow, {
      opacity: 0,
      duration: 1.6,
      delay: 1.2,
      ease: "power2.in",
    });

    const colors = [
      "#a78bfa",
      "#818cf8",
      "#e879f9",
      "#6366f1",
      "#c4b5fd",
      "#f0abfc",
    ];
    for (let i = 0; i < 60; i++) {
      const p = document.createElement("div");
      p.className = "absolute rounded-full";
      const size = 4 + Math.random() * 10;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = "50%";
      p.style.top = "50%";
      p.style.boxShadow = `0 0 16px ${p.style.background}`;
      el.appendChild(p);
    }

    const particles = Array.from(el.children);
    gsap.fromTo(
      particles,
      { x: 0, y: 0, scale: 1, opacity: 1 },
      {
        x: () => (Math.random() - 0.5) * 1200,
        y: () => (Math.random() - 0.5) * 1200,
        scale: 0,
        opacity: 0,
        duration: 2,
        ease: "power3.out",
        stagger: 0.008,
      }
    );

    [1, 2].forEach((n) => {
      const ring = document.createElement("div");
      ring.className = "absolute rounded-full border-2 border-violet-400/60";
      ring.style.left = "50%";
      ring.style.top = "50%";
      ring.style.width = "0px";
      ring.style.height = "0px";
      ring.style.transform = "translate(-50%, -50%)";
      el.appendChild(ring);

      gsap.to(ring, {
        width: "1600px",
        height: "1600px",
        opacity: 0,
        duration: 1.8,
        delay: n * 0.2,
        ease: "power2.out",
        onComplete: () => ring.remove(),
      });
    });

    // Reset auto-reopen guard for new result
    hasAutoReopenedRef.current = false;
  }, [result]);

  // ============ AUTO-SCROLL CHAT ============
  useEffect(() => {
    chatScrollRef.current?.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // ============ CLEAR ============
  const handleClear = useCallback(() => {
    sigCanvasRef.current?.clear();
    setResult(null);
    setIsCanvasEmpty(true);
    setUploadedPreview(null);
    setFollowUps([]);
    toast.info("Canvas cleared");
  }, []);

  // ============ DRAW PATH ============
  const drawPathOnCanvas = (
    path: { x: number; y: number }[],
    onComplete?: () => void
  ) => {
    if (!path.length) return;
    const canvas = sigCanvasRef.current?.getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsCanvasEmpty(false);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const progress = { t: 0 };
    gsap.to(progress, {
      t: 1,
      duration: 1.6,
      ease: "power1.inOut",
      onUpdate: () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const totalSegments = path.length - 1;
        const drawn = Math.floor(progress.t * totalSegments);

        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i <= drawn; i++) {
          ctx.lineTo(path[i].x, path[i].y);
        }
        if (drawn < totalSegments) {
          const frac = progress.t * totalSegments - drawn;
          const a = path[drawn];
          const b = path[drawn + 1];
          const x = a.x + (b.x - a.x) * frac;
          const y = a.y + (b.y - a.y) * frac;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      },
      onComplete: () => {
        toast.success("Digit drawn!");
        onComplete?.();
      },
    });
  };

  const getFallbackPath = (digit: number): { x: number; y: number }[] => {
    const paths: Record<number, number[][]> = {
      0: [[0.5, 0.2], [0.7, 0.35], [0.72, 0.6], [0.65, 0.8], [0.35, 0.8], [0.28, 0.6], [0.3, 0.35], [0.5, 0.2]],
      1: [[0.5, 0.15], [0.5, 0.85]],
      2: [[0.25, 0.3], [0.35, 0.2], [0.65, 0.2], [0.72, 0.4], [0.55, 0.6], [0.3, 0.8], [0.75, 0.8]],
      3: [[0.28, 0.2], [0.7, 0.2], [0.5, 0.45], [0.72, 0.6], [0.7, 0.8], [0.28, 0.8]],
      4: [[0.6, 0.15], [0.3, 0.55], [0.75, 0.55], [0.6, 0.85]],
      5: [[0.7, 0.2], [0.3, 0.2], [0.28, 0.45], [0.6, 0.45], [0.72, 0.65], [0.5, 0.85], [0.28, 0.82]],
      6: [[0.65, 0.2], [0.4, 0.3], [0.3, 0.55], [0.35, 0.8], [0.6, 0.85], [0.7, 0.7], [0.55, 0.6], [0.35, 0.6]],
      7: [[0.25, 0.2], [0.75, 0.2], [0.45, 0.85]],
      8: [[0.5, 0.2], [0.35, 0.35], [0.5, 0.5], [0.65, 0.65], [0.5, 0.8], [0.35, 0.65], [0.5, 0.5], [0.65, 0.35], [0.5, 0.2]],
      9: [[0.7, 0.4], [0.5, 0.2], [0.3, 0.35], [0.3, 0.55], [0.5, 0.6], [0.7, 0.55], [0.7, 0.75], [0.5, 0.85]],
    };
    const normalized = paths[digit] || paths[1];
    return normalized.map(([nx, ny]) => ({ x: nx * 280, y: ny * 280 }));
  };

  // ============ SPEAK ============
  const browserSpeak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        /(Samantha|Karen|Serena|Google UK English Female|Google US English)/i.test(
          v.name
        )
    );
    if (preferred) u.voice = preferred;
    u.rate = 0.95;
    u.pitch = 1.0;
    u.volume = 1.0;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const speak = async (text: string) => {
    if (!GROQ_KEY) {
      browserSpeak(text);
      return;
    }

    const clean = stripThinking(text)
      .replace(/\*\*/g, "")
      .replace(/[`#]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!clean) {
      setIsSpeaking(false);
      return;
    }

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsSpeaking(true);

      const { data: audioBlob } = await axios.post(
        GROQ_TTS_URL,
        {
          model: TTS_MODEL,
          voice: TTS_VOICE,
          input: clean,
          response_format: "wav",
          speed: 1.0,
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_KEY}`,
            "Content-Type": "application/json",
          },
          responseType: "blob",
        }
      );

      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        browserSpeak(clean);
      };

      await audio.play();
    } catch (e) {
      console.warn("Groq TTS failed, using browser TTS", e);
      browserSpeak(clean);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // ============ CANVAS → BLOB ============
  const getCanvasBlob = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (uploadedPreview) {
        const img = document.createElement("img");
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = 28;
          c.height = 28;
          const ctx = c.getContext("2d");
          if (!ctx) return resolve(null);
          ctx.fillStyle = "#000";
          ctx.fillRect(0, 0, 28, 28);
          ctx.drawImage(img, 0, 0, 28, 28);
          c.toBlob((b) => resolve(b), "image/png");
        };
        img.src = uploadedPreview;
        return;
      }

      const canvas = sigCanvasRef.current?.getCanvas();
      if (!canvas) return resolve(null);
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let minX = canvas.width;
      let minY = canvas.height;
      let maxX = 0;
      let maxY = 0;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          if (data[idx] > 50 || data[idx + 1] > 50 || data[idx + 2] > 50) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (minX > maxX || minY > maxY) return resolve(null);

      const boxW = maxX - minX + 1;
      const boxH = maxY - minY + 1;
      const scale = 20 / Math.max(boxW, boxH);
      const scaledW = Math.max(1, Math.round(boxW * scale));
      const scaledH = Math.max(1, Math.round(boxH * scale));

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = 28;
      exportCanvas.height = 28;
      const ectx = exportCanvas.getContext("2d");
      if (!ectx) return resolve(null);

      ectx.fillStyle = "#000000";
      ectx.fillRect(0, 0, 28, 28);
      ectx.imageSmoothingEnabled = true;
      ectx.imageSmoothingQuality = "high";
      ectx.drawImage(
        canvas,
        minX,
        minY,
        boxW,
        boxH,
        Math.round((28 - scaledW) / 2),
        Math.round((28 - scaledH) / 2),
        scaledW,
        scaledH
      );

      exportCanvas.toBlob((blob) => resolve(blob), "image/png");
    });
  };

  const downloadCanvas = () => {
    const canvas = sigCanvasRef.current?.getCanvas();
    if (!canvas) {
      toast.error("Nothing to download");
      return;
    }
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `digit-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.png`;
    a.click();
    toast.success("Canvas image downloaded");
  };

  // ============ FOLLOW-UPS ============
  const generateFollowUps = async (pred: PredictionResponse) => {
    try {
      const res = await axios.post(
        GROQ_CHAT_URL,
        {
          model: selectedModel,
          messages: [
            {
              role: "system",
              content:
                'Generate exactly 3 short follow-up questions a user might ask after seeing a CNN prediction. Return ONLY a JSON array of 3 strings.',
            },
            {
              role: "user",
              content: `CNN predicted digit ${pred.predicted_digit} with ${pred.confidence}% confidence.`,
            },
          ],
          temperature: 0.8,
          max_tokens: 150,
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const raw = stripThinking(
        res.data?.choices?.[0]?.message?.content?.trim() || "[]"
      );
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      if (Array.isArray(parsed)) setFollowUps(parsed.slice(0, 3));
    } catch {
      /* ignore */
    }
  };

  // ============ CHAT STREAMING ============
  const handleSendChat = async (overrideText?: string) => {
    const text = overrideText || chatInput.trim();
    if (!text || isChatStreaming) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setChatInput("");
    setFollowUps([]);
    setIsChatStreaming(true);

    const systemPrompt = `You are a helpful AI assistant for a Digit Recognizer CNN app built with TensorFlow, FastAPI, and Next.js. 
The model achieves 98.90% test accuracy on MNIST (42,000 training samples, 20% test split).
${result ? `The user just drew a digit and the CNN predicted ${result.predicted_digit} with ${result.confidence}% confidence.` : ""}
Keep responses concise (2-3 sentences) and conversational. Avoid markdown emphasis. Never include your internal reasoning or thinking process in the response.`;

    try {
      const response = await axios.post(
        GROQ_CHAT_URL,
        {
          model: selectedModel,
          messages: [
            { role: "system", content: systemPrompt },
            ...nextMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          ],
          stream: true,
          temperature: 0.7,
          max_tokens: 400,
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_KEY}`,
            "Content-Type": "application/json",
          },
          responseType: "stream",
          adapter: "fetch",
        }
      );

      const stream = response.data as ReadableStream<Uint8Array>;
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      let rawText = "";
      const assistantTs = Date.now();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", timestamp: assistantTs },
      ]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const jsonStr = trimmed.replace("data:", "").trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content || "";
            rawText += delta;
            const cleaned = stripThinking(rawText);
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = {
                role: "assistant",
                content: cleaned,
                timestamp: assistantTs,
              };
              return copy;
            });
          } catch {
            /* ignore */
          }
        }
      }

      const finalText = stripThinking(rawText);

      if (voiceEnabled && finalText) {
        speak(finalText);
      }

      const followUpsRes = await axios.post(
        GROQ_CHAT_URL,
        {
          model: selectedModel,
          messages: [
            {
              role: "system",
              content:
                'Generate exactly 3 short follow-up questions the user might ask next. Return ONLY a JSON array of 3 strings like ["q1","q2","q3"]. No other text.',
            },
            {
              role: "user",
              content: `User: "${text}"\nAssistant: "${finalText}"`,
            },
          ],
          temperature: 0.8,
          max_tokens: 200,
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const rawFollow = stripThinking(
        followUpsRes.data?.choices?.[0]?.message?.content?.trim() || "[]"
      );
      try {
        const cleaned = rawFollow.replace(/```json|```/g, "").trim();
        // Extract JSON array if there's surrounding text
        const match = cleaned.match(/\[[\s\S]*\]/);
        const jsonStr = match ? match[0] : cleaned;
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) setFollowUps(parsed.slice(0, 3));
      } catch {
        /* ignore */
      }
    } catch (e: any) {
      toast.error(e?.message || "Groq request failed");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't reach the AI service.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsChatStreaming(false);
    }
  };

  // ============ PREDICT ============
  const handlePredict = async () => {
    if (!uploadedPreview && isCanvasEmpty) {
      toast.error("Draw a digit or upload an image first!");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setFollowUps([]);

    try {
      const blob = await getCanvasBlob();
      if (!blob) {
        toast.error("Canvas is empty — nothing to predict");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", blob, "digit.png");

      const { data } = await axios.post<PredictionResponse>(
        `${API_URL}/predict`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResult(data);
      toast.success(`Predicted: ${data.predicted_digit} (${data.confidence}%)`);

      if (voiceEnabled) {
        speak(
          `I think this is a ${data.predicted_digit}, with ${data.confidence} percent confidence.`
        );
      }

      generateFollowUps(data);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ============ STOP LISTENING (clean shutdown) ============
  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    setIsListening(false);
    setTranscript("");
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setMicLevel(0);
  };

  // ============ VOICE COMMAND HANDLER ============
  const handleVoiceCommand = async (text: string) => {
    const lower = text.toLowerCase().trim();

    stopListening();

    const drawMatch = lower.match(
      /(?:draw|write|make|sketch)\s+(?:a\s+|an\s+|the\s+)?(\d|zero|one|two|three|four|five|six|seven|eight|nine)/
    );
    if (drawMatch) {
      const wordToDigit: Record<string, number> = {
        zero: 0, one: 1, two: 2, three: 3, four: 4,
        five: 5, six: 6, seven: 7, eight: 8, nine: 9,
      };
      const token = drawMatch[1];
      const digit = isNaN(parseInt(token)) ? wordToDigit[token] : parseInt(token);

      if (!isNaN(digit)) {
        setChatOpen(false);
        setUploadedPreview(null);

        setTimeout(() => {
          const path = getFallbackPath(digit);
          drawPathOnCanvas(path, () => {
            setTimeout(() => handlePredict(), 400);
          });
          speak(`Drawing a ${digit}`);
        }, 350);

        setMessages((prev) => [
          ...prev,
          { role: "user", content: text, timestamp: Date.now() },
          {
            role: "assistant",
            content: `Drawing a ${digit} on the canvas — predicting now!`,
            timestamp: Date.now(),
          },
        ]);
        return;
      }
    }

    if (/(clear|reset|erase|wipe)/.test(lower)) {
      handleClear();
      speak("Canvas cleared.");
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text, timestamp: Date.now() },
        {
          role: "assistant",
          content: "Canvas cleared. What next?",
          timestamp: Date.now(),
        },
      ]);
      return;
    }

    if (/(predict|guess|what is it|recognize)/.test(lower)) {
      setChatOpen(false);
      speak("Predicting now");
      setTimeout(() => handlePredict(), 350);
      return;
    }

    handleSendChat(text);
  };

  useEffect(() => {
    handleVoiceCommandRef.current = handleVoiceCommand;
  }, [handleVoiceCommand]);

  // ============ TOGGLE LISTENING ============
  const toggleListening = async () => {
    if (isListening) {
      stopListening();
      return;
    }

    if (!recognitionRef.current) {
      toast.error("Voice not supported. Use Chrome, Edge, or Opera.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const AudioCtx =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        setMicLevel(Math.min(100, rms * 400));
        animationFrameRef.current = requestAnimationFrame(tick);
      };
      tick();

      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
      toast.info("🎙️ Speak now: 'draw a 7', 'clear', or 'predict'");
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        toast.error("Microphone permission denied.");
      } else if (err.name === "NotFoundError") {
        toast.error("No microphone detected.");
      } else {
        toast.error("Could not access microphone.");
      }
      setIsListening(false);
    }
  };

  // ============ PDF: PREDICTION ============
  const downloadPDF = async () => {
    if (!result) return;
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    doc.setFillColor(20, 15, 40);
    doc.rect(0, 0, pageW, 40, "F");
    doc.setTextColor(200, 190, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Digit Recognizer Report", 14, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 180, 200);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    doc.setTextColor(30, 30, 40);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Prediction", 14, 55);
    doc.setFontSize(48);
    doc.setTextColor(124, 58, 237);
    doc.text(String(result.predicted_digit), 14, 85);
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 90);
    doc.setFont("helvetica", "normal");
    doc.text(`Confidence: ${result.confidence}%`, 14, 98);
    doc.text(`File: ${result.filename}`, 14, 105);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 40);
    doc.setFontSize(14);
    doc.text("All Probabilities", 14, 125);
    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    result.all_probabilities.forEach((p, i) => {
      doc.text(`${i}: ${p.toFixed(2)}%`, 14, 135 + i * 6);
    });

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 160);
    doc.text(
      "Generated by Digit Recognizer · CNN · TensorFlow + FastAPI + Next.js",
      14,
      doc.internal.pageSize.getHeight() - 10
    );

    doc.save(`digit-prediction-${result.predicted_digit}.pdf`);
    toast.success("PDF downloaded");
  };

  // ============ DOWNLOAD CHAT TXT ============
  const downloadChatTXT = () => {
    const lines = messages.map((m) => {
      const time = m.timestamp ? new Date(m.timestamp).toLocaleString() : "";
      const who = m.role === "user" ? "You" : "AI";
      return `[${time}] ${who}:\n${m.content}\n`;
    });
    const blob = new Blob([lines.join("\n---\n\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Chat downloaded as TXT");
  };

  // ============ DOWNLOAD CHAT PDF ============
  const downloadChatPDF = () => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    doc.setFillColor(20, 15, 40);
    doc.rect(0, 0, pageW, 30, "F");
    doc.setTextColor(200, 190, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Chat Transcript", 14, 20);

    let y = 42;
    const margin = 14;
    const maxWidth = pageW - margin * 2;

    messages.forEach((m) => {
      const who = m.role === "user" ? "You" : "AI Assistant";
      const time = m.timestamp ? new Date(m.timestamp).toLocaleString() : "";

      if (y > pageH - 40) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(m.role === "user" ? "#7c3aed" : "#10b981");
      doc.text(who, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 160);
      doc.text(time, margin + 45, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 50);
      const lines = doc.splitTextToSize(m.content, maxWidth);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 8;

      doc.setDrawColor(220, 220, 230);
      doc.line(margin, y - 4, pageW - margin, y - 4);
      y += 4;
    });

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 160);
    doc.text("Generated by Digit Recognizer · Groq AI", 14, pageH - 8);

    doc.save(`chat-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.pdf`);
    toast.success("Chat downloaded as PDF");
  };

  // ============ DROPZONE ============
  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedPreview(reader.result as string);
      setIsCanvasEmpty(false);
      setResult(null);
    };
    reader.readAsDataURL(file);
    toast.success("Image uploaded");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  // ============ KEYBOARD ============
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !chatOpen && !isListening) handlePredict();
      if (e.key === "Escape" && !chatOpen) handleClear();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatOpen, isListening]);

  const fmtTime = (ts?: number) => {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // ============ AUTO-REOPEN CHAT (once) ============
  useEffect(() => {
    if (
      !isSpeaking &&
      result &&
      !chatOpen &&
      !isLoading &&
      !hasAutoReopenedRef.current
    ) {
      hasAutoReopenedRef.current = true;
      const t = setTimeout(() => {
        setChatOpen(true);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [isSpeaking, result, chatOpen, isLoading]);

  // ============ RENDER ============
  return (
    <>
      <Toaster theme="dark" position="top-right" richColors />

      <div
        ref={pageGlowRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-30 opacity-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(139,92,246,0.35) 0%, rgba(99,102,241,0.15) 40%, transparent 70%)",
        }}
      />

      <div
        ref={particlesRef}
        className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-16 lg:py-20">
        <div ref={heroRef} className="mb-14 text-center">
          <Badge
            variant="outline"
            className="mb-5 border-violet-500/40 bg-violet-500/10 px-3 py-1 text-violet-300"
          >
            <Brain className="mr-1.5 h-3 w-3" />
            Powered by TensorFlow + FastAPI + Groq
          </Badge>

          <h1 className="gradient-text text-5xl font-bold tracking-tight sm:text-6xl lg:text-6xl">
            Digit Recognizer
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base text-neutral-400 sm:text-lg">
            Draw, upload, or{" "}
            <span className="font-semibold text-violet-300">say</span> a digit —
            our CNN predicts it while the AI explains every step.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
          {/* CANVAS PANEL */}
          <div ref={canvasPanelRef}>
            <Card className="glass-card border-neutral-800/60">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-neutral-200">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                  Draw or Upload Your Digit
                </CardTitle>
                <div className="flex items-center gap-2">
                  {!isCanvasEmpty && (
                    <button
                      onClick={downloadCanvas}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/60 text-neutral-400 transition-colors hover:border-violet-500/40 hover:text-violet-200"
                      title="Download canvas image"
                    >
                      <ImageDown className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={toggleListening}
                    className={`relative flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                      isListening
                        ? "border-red-500/40 bg-red-500/20 text-red-300"
                        : "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-violet-500/40 hover:text-violet-200"
                    }`}
                    title="Click, then speak: 'draw a 7'"
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                    {isListening && (
                      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    )}
                  </button>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col items-center gap-5">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-violet-600/30 via-indigo-600/20 to-transparent blur-lg" />
                  <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-neutral-700 bg-black shadow-2xl">
                    {uploadedPreview ? (
                      <div className="relative h-[280px] w-[280px]">
                        <Image
                          src={uploadedPreview}
                          alt="Uploaded digit"
                          fill
                          className="object-contain grayscale"
                        />
                        <button
                          onClick={() => {
                            setUploadedPreview(null);
                            setIsCanvasEmpty(true);
                          }}
                          className="absolute top-2 right-2 rounded-full bg-neutral-900/80 p-1.5 text-neutral-300 hover:bg-neutral-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <SignatureCanvas
                        ref={sigCanvasRef}
                        penColor="white"
                        minWidth={1.5}
                        maxWidth={2.5}
                        velocityFilterWeight={0.5}
                        dotSize={1.5}
                        canvasProps={{
                          width: 280,
                          height: 280,
                          className: "cursor-crosshair",
                        }}
                        onBegin={() => setIsCanvasEmpty(false)}
                      />
                    )}
                  </div>
                </div>

                {/* LISTENING WAVES */}
                <AnimatePresence>
                  {isListening && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex w-full flex-col gap-3 rounded-2xl border border-red-500/30 bg-gradient-to-b from-red-500/10 to-red-500/5 p-4"
                    >
                      <div className="flex h-12 items-center justify-center gap-1">
                        {Array.from({ length: 30 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 rounded-full bg-gradient-to-t from-red-500 via-red-400 to-rose-300 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                            animate={{
                              height: [
                                4,
                                4 + Math.random() * 30,
                                4,
                                4 + Math.random() * 24,
                                4,
                              ],
                            }}
                            transition={{
                              duration: 0.8 + Math.random() * 0.6,
                              repeat: Infinity,
                              delay: i * 0.04,
                              ease: "easeInOut",
                            }}
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                        </div>
                        <span className="flex-1 truncate text-xs font-medium text-red-200">
                          {transcript || "🎙️ Listening..."}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-red-300/70">
                          MIC
                        </span>
                        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-neutral-800">
                          <div
                            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 transition-all duration-100"
                            style={{ width: `${micLevel}%` }}
                          />
                        </div>
                        <span className="w-8 text-right font-mono text-[10px] text-red-300/70">
                          {Math.round(micLevel)}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* SPEAKING WAVES */}
                <AnimatePresence>
                  {isSpeaking && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex w-full flex-col gap-3 rounded-2xl border border-violet-500/30 bg-gradient-to-b from-violet-500/10 to-violet-500/5 p-4"
                    >
                      <div className="flex h-12 items-center justify-center gap-1">
                        {Array.from({ length: 30 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 rounded-full bg-gradient-to-t from-violet-600 via-violet-400 to-fuchsia-300 shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                            animate={{
                              height: [
                                4,
                                6 + Math.random() * 32,
                                4,
                                6 + Math.random() * 26,
                                4,
                              ],
                            }}
                            transition={{
                              duration: 0.7 + Math.random() * 0.5,
                              repeat: Infinity,
                              delay: i * 0.03,
                              ease: "easeInOut",
                            }}
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-2 w-2">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
                        </div>
                        <span className="flex-1 truncate text-xs font-medium text-violet-200">
                          Speaking response...
                        </span>
                        <button
                          onClick={() => {
                            stopSpeaking();
                            hasAutoReopenedRef.current = true;
                            setTimeout(() => setChatOpen(true), 200);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20 text-violet-200 transition-colors hover:bg-violet-500/40"
                          title="Stop speaking"
                        >
                          <VolumeX className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div
                  {...getRootProps()}
                  className={`w-full cursor-pointer rounded-xl border border-dashed p-3 text-center transition-colors ${
                    isDragActive
                      ? "border-violet-500/60 bg-violet-500/10"
                      : "border-neutral-800 bg-neutral-900/40 hover:border-violet-500/40"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
                    <Upload className="h-3.5 w-3.5" />
                    Drop an image or click to upload (PNG · JPG · WebP · 5MB)
                  </div>
                </div>

                <div className="flex w-full gap-3">
                  <button
                    onClick={handleClear}
                    className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl border border-neutral-700/80 bg-neutral-900/60 px-4 py-3 text-sm font-medium text-neutral-300 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-600 hover:bg-neutral-800/80 hover:text-neutral-100"
                  >
                    <Eraser className="h-4 w-4 transition-transform group-hover:rotate-12" />
                    Clear
                  </button>

                  <button
                    onClick={handlePredict}
                    disabled={isLoading || isCanvasEmpty}
                    className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-violet-500/50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    {isLoading ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Predicting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Predict
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-neutral-500">
                  Try saying:{" "}
                  <span className="text-violet-300">"draw a 7"</span>,{" "}
                  <span className="text-violet-300">"clear"</span>,{" "}
                  <span className="text-violet-300">"predict"</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* RESULT PANEL */}
          <div ref={resultPanelRef}>
            <Card className="glass-card h-full border-neutral-800/60">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-neutral-200">
                  <Brain className="h-5 w-5 text-indigo-400" />
                  Prediction Result
                </CardTitle>
                {result && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        isSpeaking
                          ? stopSpeaking()
                          : speak(`Digit ${result.predicted_digit}`)
                      }
                      className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-2 text-neutral-400 hover:border-violet-500/40 hover:text-violet-200"
                    >
                      {isSpeaking ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={downloadPDF}
                      className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-2 text-neutral-400 hover:border-violet-500/40 hover:text-violet-200"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <AnimatePresence mode="wait">
                  {!result && !isLoading && (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex h-80 flex-col items-center justify-center gap-3 text-center text-neutral-500"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/60">
                        <AlertCircle className="h-7 w-7" />
                      </div>
                      <p className="text-sm">
                        Draw a digit and press Predict to see the magic
                      </p>
                    </motion.div>
                  )}

                  {isLoading && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex h-80 flex-col items-center justify-center gap-4 text-neutral-400"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 animate-ping rounded-full bg-violet-600/30" />
                        <LoaderCircle className="relative h-12 w-12 animate-spin text-violet-400" />
                      </div>
                      <p className="text-sm">Analyzing your digit...</p>
                    </motion.div>
                  )}

                  {result && !isLoading && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      }}
                      className="flex flex-col gap-6"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
                          Predicted Digit
                        </span>
                        <motion.span
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 15,
                            delay: 0.1,
                          }}
                          className="bg-gradient-to-br from-violet-400 via-violet-300 to-indigo-400 bg-clip-text font-mono text-8xl font-bold text-transparent"
                        >
                          {result.predicted_digit}
                        </motion.span>
                        <Badge
                          variant="outline"
                          className="mt-3 border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-emerald-300"
                        >
                          <CheckCircle2 className="mr-1.5 h-3 w-3" />
                          {result.confidence}% confidence
                        </Badge>
                      </div>

                      <div className="space-y-2.5">
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
                          All Probabilities
                        </p>
                        {result.all_probabilities.map((prob, digit) => (
                          <div
                            key={digit}
                            className="flex items-center gap-3"
                          >
                            <span
                              className={`w-4 font-mono text-sm ${
                                digit === result.predicted_digit
                                  ? "font-bold text-violet-300"
                                  : "text-neutral-500"
                              }`}
                            >
                              {digit}
                            </span>
                            <Progress
                              value={prob}
                              className="h-1.5 flex-1 bg-neutral-800"
                            />
                            <span
                              className={`w-14 text-right font-mono text-xs ${
                                digit === result.predicted_digit
                                  ? "text-violet-300"
                                  : "text-neutral-500"
                              }`}
                            >
                              {prob.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>

                      {followUps.length > 0 && (
                        <div className="space-y-2">
                          <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
                            <Wand2 className="h-3 w-3" />
                            Suggested follow-ups
                          </p>
                          <div className="flex flex-col gap-2">
                            {followUps.map((q, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  setChatOpen(true);
                                  handleSendChat(q);
                                }}
                                className="rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-left text-xs text-neutral-300 transition-colors hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-200"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={handleClear}
                          className="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-700/80 bg-neutral-900/60 px-4 py-2.5 text-sm font-medium text-neutral-300 transition-all hover:-translate-y-0.5 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-200"
                        >
                          <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180" />
                          Try Another
                        </button>
                        <button
                          onClick={() => setChatOpen(true)}
                          className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/30 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-violet-500/50"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Ask AI
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-14 font-mono text-xs text-neutral-600"
        >
          CNN · 28×28 · MNIST · FastAPI · Next.js · Groq
        </motion.p>
      </div>

      {/* FLOATING CHAT BUTTON */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed right-6 bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-2xl shadow-violet-600/50 transition-transform hover:scale-110"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* CHAT DRAWER */}
      <AnimatePresence>
        {chatOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 z-50 flex h-screen w-full max-w-md flex-col border-l border-neutral-800 bg-neutral-950 shadow-2xl"
            >
              {/* ============ STICKY HEADER ============ */}
              <div className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-800 bg-neutral-950 p-4 shadow-sm shadow-black/40">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-100">
                      AI Assistant
                    </p>
                    <div className="relative">
                      <button
                        onClick={() => setModelDropdownOpen((v) => !v)}
                        className="flex items-center gap-1 font-mono text-[10px] text-neutral-500 hover:text-violet-300"
                      >
                        <Cpu className="h-2.5 w-2.5" />
                        {selectedModel}
                        <ChevronDown className="h-2.5 w-2.5" />
                      </button>
                      {modelDropdownOpen && availableModels.length > 0 && (
                        <div className="absolute top-full left-0 z-30 mt-1 max-h-60 w-64 overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-900 shadow-2xl">
                          {availableModels.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => {
                                setSelectedModel(m.id);
                                setModelDropdownOpen(false);
                              }}
                              className={`block w-full px-3 py-2 text-left font-mono text-[11px] transition-colors ${
                                m.id === selectedModel
                                  ? "bg-violet-500/20 text-violet-200"
                                  : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                              }`}
                            >
                              {m.id}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-1.5 text-neutral-400 hover:border-violet-500/40 hover:text-violet-200"
                        title="Download chat"
                      >
                        <FileDown className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="border-neutral-800 bg-neutral-900 text-neutral-200"
                    >
                      <DropdownMenuItem
                        onClick={downloadChatTXT}
                        className="cursor-pointer gap-2 focus:bg-violet-500/20 focus:text-violet-200"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Download as TXT
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={downloadChatPDF}
                        className="cursor-pointer gap-2 focus:bg-violet-500/20 focus:text-violet-200"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Download as PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {isSpeaking && (
                    <button
                      onClick={stopSpeaking}
                      className="rounded-lg border border-violet-500/40 bg-violet-500/20 p-1.5 text-violet-200 hover:bg-violet-500/40"
                      title="Stop speaking"
                    >
                      <VolumeX className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setChatOpen(false)}
                    className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-1.5 text-neutral-400 hover:border-violet-500/40 hover:text-violet-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* ============ MESSAGES ============ */}
              <div
                ref={chatScrollRef}
                data-lenis-prevent
                className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 pt-6 pb-4"
                style={{ overscrollBehavior: "contain" }}
              >
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${
                      m.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        m.role === "user"
                          ? "bg-neutral-800 text-neutral-400"
                          : "bg-gradient-to-br from-violet-600 to-indigo-600 text-white"
                      }`}
                    >
                      {m.role === "user" ? (
                        <UserIcon className="h-3.5 w-3.5" />
                      ) : (
                        <Bot className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div
                      className={`flex max-w-[80%] flex-col gap-1 ${
                        m.role === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          m.role === "user"
                            ? "bg-violet-600/20 text-violet-100"
                            : "bg-neutral-900 text-neutral-200"
                        }`}
                      >
                        {m.content ? (
                          <span className="whitespace-pre-wrap">
                            {m.content}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-neutral-500">
                            <span className="inline-flex gap-1">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400 [animation-delay:150ms]" />
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400 [animation-delay:300ms]" />
                            </span>
                            <span className="text-xs italic">Thinking...</span>
                          </span>
                        )}
                      </div>
                      <span className="px-1 text-[10px] text-neutral-600">
                        {fmtTime(m.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}

                {followUps.length > 0 && !isChatStreaming && (
                  <div className="flex flex-col gap-2 pl-10">
                    {followUps.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendChat(q)}
                        className="rounded-lg border border-violet-500/30 bg-violet-500/5 px-3 py-2 text-left text-xs text-violet-200 transition-colors hover:bg-violet-500/15"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Voice commands hint */}
              <div className="border-t border-neutral-800 bg-neutral-950/60 px-4 py-2">
                <p className="flex items-center gap-1.5 text-[10px] text-neutral-600">
                  <PenTool className="h-2.5 w-2.5" />
                  Voice commands: "draw a 7" · "clear" · "predict"
                </p>
              </div>

              {/* Input */}
              <div className="border-t border-neutral-800 p-3">
                <div className="flex items-end gap-2">
                  <button
                    onClick={toggleListening}
                    className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                      isListening
                        ? "border-red-500/40 bg-red-500/20 text-red-300"
                        : "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-violet-500/40 hover:text-violet-200"
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                    {isListening && (
                      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 animate-pulse rounded-full bg-red-500" />
                    )}
                  </button>

                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        const lower = chatInput.toLowerCase().trim();
                        const isDrawCmd = /(?:draw|write|make|sketch)\s+(?:a\s+|an\s+|the\s+)?(\d|zero|one|two|three|four|five|six|seven|eight|nine)/.test(
                          lower
                        );
                        if (isDrawCmd) {
                          handleVoiceCommand(chatInput);
                        } else {
                          handleSendChat();
                        }
                      }
                    }}
                    placeholder="Ask anything, or say 'draw a 3'..."
                    rows={1}
                    className="max-h-32 flex-1 resize-none rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-violet-500/40 focus:outline-none"
                  />

                  <button
                    onClick={() => {
                      const lower = chatInput.toLowerCase().trim();
                      const isDrawCmd = /(?:draw|write|make|sketch)\s+(?:a\s+|an\s+|the\s+)?(\d|zero|one|two|three|four|five|six|seven|eight|nine)/.test(
                        lower
                      );
                      if (isDrawCmd) {
                        handleVoiceCommand(chatInput);
                      } else {
                        handleSendChat();
                      }
                    }}
                    disabled={!chatInput.trim() || isChatStreaming}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30 transition-all hover:shadow-violet-500/50 disabled:opacity-40"
                  >
                    {isChatStreaming ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}