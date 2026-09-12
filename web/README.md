# 🔢 Digit Recognizer — Frontend

> Next.js frontend for the AI Powered Number Classifier. Draw, speak, or upload a digit and get real-time predictions powered by a CNN with **98.9% accuracy**.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](YOUR_LIVE_LINK_HERE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com)

---

## 🚀 Live Demo

**→ [Digit Recognizer](YOUR_LIVE_LINK_HERE)**

> _Update this link after deploying to Vercel._

---

## ✨ Features

- ✏️ **Draw** digits on a real-time canvas
- 🖼️ **Upload** images (PNG · JPG · WebP)
- 🎙️ **Voice commands** — say *"draw a seven"*, *"clear"*, or *"predict"*
- 💬 **AI chat** powered by Groq for explanations and follow-ups
- 🔊 **Voice responses** with natural-sounding TTS
- 📄 **Export** predictions and chats as PDF
- 🎨 **GSAP animations** — particle bursts, waveforms, and glow effects
- 🌙 Fully responsive dark UI with Tailwind CSS

---

## 🧰 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animations | GSAP + Framer Motion |
| Voice | Web Speech API + Groq TTS |
| AI Chat | Groq (Llama 3.3 70B) |
| PDF | jsPDF |
| Icons | lucide-react + react-icons |

---

## ⚙️ Getting Started

### 1. Install dependencies

```bash
pnpm install
2. Configure environment variables
Create a .env.local file in the root of the web/ directory and add the following two variables:

env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key_here