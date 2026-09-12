"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Brain,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
  Home,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home, description: "Overview" },
  {
    href: "/prediction-lab",
    label: "Prediction Lab",
    icon: Sparkles,
    description: "Draw & predict digits",
  },
  {
    href: "/about",
    label: "About the Model",
    icon: Brain,
    description: "Architecture & results",
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const sidebarRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // GSAP entrance (desktop only)
  useEffect(() => {
    if (!isMounted || !sidebarRef.current) return;
    if (typeof window === "undefined") return;
    if (window.innerWidth < 1024) return;

    const ctx = gsap.context(() => {
      gsap.from(sidebarRef.current, {
        x: -60,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        clearProps: "all",
      });
      if (navRef.current?.children) {
        gsap.from(navRef.current.children, {
          x: -20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.08,
          delay: 0.15,
          ease: "power3.out",
          clearProps: "all",
        });
      }
      if (footerRef.current) {
        gsap.from(footerRef.current, {
          y: 20,
          opacity: 0,
          duration: 0.6,
          delay: 0.4,
          ease: "power3.out",
          clearProps: "all",
        });
      }
    });

    return () => ctx.revert();
  }, [isMounted]);

  // Auto-close on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Lock scroll when mobile drawer is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ✅ FIX: base w-72 on mobile, lg:w-20 only when collapsed on desktop
  const widthClass = isCollapsed ? "lg:w-20" : "lg:w-72";

  return (
    <TooltipProvider delayDuration={100}>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className={`fixed top-4 left-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/80 text-neutral-300 backdrop-blur-lg transition-opacity hover:border-violet-500/40 hover:text-violet-200 lg:hidden ${
          isMobileOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        aria-label="Open sidebar"
        aria-expanded={isMobileOpen}
        aria-controls="mobile-sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ✅ Sidebar: w-72 base, lg:w-20 only when collapsed on desktop */}
      <aside
        ref={sidebarRef}
        id="mobile-sidebar"
        aria-hidden={!isMobileOpen && isMounted}
        className={`fixed top-0 left-0 z-40 flex h-screen w-72 flex-col border-r border-neutral-800/80 bg-neutral-950/95 backdrop-blur-xl transition-[transform,width] duration-300 ease-out ${widthClass} ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* ✅ Header: always justify-between on mobile, and stack differently on desktop */}
        <div
          className={`relative flex items-center border-b border-neutral-800/80 p-4 ${
            isCollapsed ? "lg:justify-center" : "justify-between"
          }`}
        >
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-3 overflow-hidden"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-violet-500/30 shadow-lg shadow-violet-600/30"
            >
              <Image
                src="/logo.png"
                alt="Digit Recognizer"
                fill
                sizes="44px"
                className="object-cover"
                priority
              />
            </motion.div>

            {/* ✅ Only hide text when collapsed on desktop */}
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <p className="text-sm font-semibold tracking-tight text-neutral-100">
                  Digit Recognizer
                </p>
                <p className="font-mono text-[11px] text-neutral-500">
                  CNN · v1.0
                </p>
              </motion.div>
            )}

            {/* ✅ Mobile-only label — always visible on mobile */}
            <div className="flex flex-col lg:hidden">
              <p className="text-sm font-semibold tracking-tight text-neutral-100">
                Digit Recognizer
              </p>
              <p className="font-mono text-[11px] text-neutral-500">
                CNN · v1.0
              </p>
            </div>
          </Link>

          {/* Desktop collapse button */}
          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="hidden h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/60 text-neutral-500 transition-colors hover:border-violet-500/40 hover:text-violet-200 lg:flex"
              aria-label="Collapse sidebar"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          )}

          {/* ✅ Mobile close button — absolutely positioned, no overlap */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/60 text-neutral-500 transition-colors hover:border-violet-500/40 hover:text-violet-200 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Desktop expand button */}
        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="mx-auto mt-3 hidden h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/60 text-neutral-500 transition-colors hover:border-violet-500/40 hover:text-violet-200 lg:flex"
            aria-label="Expand sidebar"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        )}

        {/* Nav */}
        <nav ref={navRef} className="flex-1 space-y-1.5 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            const linkContent = (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                  isCollapsed ? "lg:justify-center" : ""
                } ${
                  isActive
                    ? "text-violet-200"
                    : "text-neutral-400 hover:bg-neutral-900/60 hover:text-neutral-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 -z-10 rounded-xl border border-violet-500/30 bg-gradient-to-r from-violet-500/15 to-indigo-500/10"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <Icon
                  className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? "text-violet-300" : ""
                  }`}
                />
                {!isCollapsed && (
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium tracking-tight">
                      {item.label}
                    </span>
                    <span className="truncate text-[11px] text-neutral-500">
                      {item.description}
                    </span>
                  </div>
                )}
                {/* ✅ Mobile-only labels — always visible */}
                <div className="flex min-w-0 flex-col lg:hidden">
                  <span className="truncate text-sm font-medium tracking-tight">
                    {item.label}
                  </span>
                  <span className="truncate text-[11px] text-neutral-500">
                    {item.description}
                  </span>
                </div>
              </Link>
            );

            return isCollapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="border-neutral-800 bg-neutral-900 text-neutral-200"
                >
                  {item.label}
                </TooltipContent>
              </Tooltip>
            ) : (
              linkContent
            );
          })}
        </nav>

        {/* Footer */}
        <div
          ref={footerRef}
          className={`mt-auto space-y-4 border-t border-neutral-800/80 p-4 ${
            isCollapsed ? "lg:flex lg:flex-col lg:items-center" : ""
          }`}
        >
          {!isCollapsed ? (
            <>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500">
                  Author
                </p>
                <p className="mt-1.5 text-sm font-semibold tracking-tight text-neutral-200">
                  Sheharyar Sarmad
                </p>
                <p className="font-mono text-[11px] text-neutral-500">
                  AI · Deep Learning
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 lg:flex-col">
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-center gap-2 border-neutral-800 bg-neutral-900/40 px-3 py-2 text-xs text-neutral-300 transition-all hover:-translate-y-0.5 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-200"
                >
                  <a
                    href="https://github.com/Sheharyar-Sarmad/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <FaGithub className="h-3.5 w-3.5 shrink-0" />
                    <span>GitHub</span>
                  </a>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-center gap-2 border-neutral-800 bg-neutral-900/40 px-3 py-2 text-xs text-neutral-300 transition-all hover:-translate-y-0.5 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-200"
                >
                  <a
                    href="https://www.linkedin.com/in/sheharyar-sarmad-9b7736289/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <FaLinkedin className="h-3.5 w-3.5 shrink-0" />
                    <span>LinkedIn</span>
                  </a>
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Desktop collapsed icons */}
              <div className="hidden flex-col items-center gap-2 lg:flex">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://github.com/Sheharyar-Sarmad/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-violet-500/40 hover:text-violet-200"
                    >
                      <FaGithub className="h-4 w-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="border-neutral-800 bg-neutral-900 text-neutral-200"
                  >
                    GitHub
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://www.linkedin.com/in/sheharyar-sarmad-9b7736289/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:border-blue-500/40 hover:text-blue-200"
                    >
                      <FaLinkedin className="h-4 w-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="border-neutral-800 bg-neutral-900 text-neutral-200"
                  >
                    LinkedIn
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Mobile expanded footer (always full width on mobile) */}
              <div className="flex flex-col gap-2 lg:hidden">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500">
                    Author
                  </p>
                  <p className="mt-1.5 text-sm font-semibold tracking-tight text-neutral-200">
                    Sheharyar Sarmad
                  </p>
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-center gap-2 border-neutral-800 bg-neutral-900/40 px-3 py-2 text-xs text-neutral-300"
                >
                  <a
                    href="https://github.com/Sheharyar-Sarmad/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2"
                  >
                    <FaGithub className="h-3.5 w-3.5 shrink-0" />
                    <span>GitHub</span>
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-center gap-2 border-neutral-800 bg-neutral-900/40 px-3 py-2 text-xs text-neutral-300"
                >
                  <a
                    href="https://www.linkedin.com/in/sheharyar-sarmad-9b7736289/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2"
                  >
                    <FaLinkedin className="h-3.5 w-3.5 shrink-0" />
                    <span>LinkedIn</span>
                  </a>
                </Button>
              </div>
            </>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}