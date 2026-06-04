"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ScanLine, ShieldCheck } from "lucide-react";
import { ContentPageShell } from "@/components/content/content-page-shell";
import { GetInTouch } from "@/components/ui/get-in-touch";

// Typing animation component - types once and stays fixed
const TypingText = () => {
  const words = ["Authenticate.", "Verify.", "Trust."];
  const [displayedText, setDisplayedText] = useState<string[]>(["", "", ""]);
  const [finished, setFinished] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const hasTyped = useRef(false);

  useEffect(() => {
    if (hasTyped.current) {
      setDisplayedText(words);
      setFinished(true);
      return;
    }

    hasTyped.current = true;
    let mounted = true;
    let wordIndex = 0;
    let charIndex = 0;

    const type = () => {
      if (!mounted || wordIndex >= words.length) {
        setFinished(true);
        return;
      }

      const word = words[wordIndex];
      
      if (charIndex < word.length) {
        charIndex++;
        setDisplayedText(prev => {
          const newText = [...prev];
          newText[wordIndex] = word.substring(0, charIndex);
          return newText;
        });
        setTimeout(type, 80 + Math.random() * 50);
      } else {
        wordIndex++;
        charIndex = 0;
        setTimeout(type, 300);
      }
    };

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    setTimeout(type, 500);
    
    return () => {
      mounted = false;
      clearInterval(cursorInterval);
    };
  }, []);

  return (
    <h1 id="home-hero-title" className="home-hero__title">
      <span className="home-hero__title-line">
        {displayedText[0]}
        {!finished && 0 < 3 && <span className={showCursor ? "opacity-100" : "opacity-0"}>|</span>}
      </span>
      <span className="home-hero__title-line">
        {displayedText[1]}
      </span>
      <span className="home-hero__title-line home-hero__title-line--accent">
        {displayedText[2]}
      </span>
    </h1>
  );
};

// Counting animation hook - with localStorage persistence!
const useCountAnimation = (target: number, duration = 2000, format = (v: number) => String(v), key: string) => {
  const [count, setCount] = useState(target);
  const isAnimating = useRef(false);

  useEffect(() => {
    // Check if we've already animated this value before
    const hasAnimatedBefore = localStorage.getItem(`gdav_animated_${key}`);
    
    if (hasAnimatedBefore === 'true') {
      setCount(target);
      return;
    }

    // Animate from 0 to target
    isAnimating.current = true;
    setCount(0);
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Ease out quart
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.round(easeOut * target);
      
      setCount(currentCount);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        localStorage.setItem(`gdav_animated_${key}`, 'true');
        isAnimating.current = false;
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [target, duration, key]);

  return format(count);
};

// Animated Background Component
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-transparent to-cyan-500/15 dark:from-blue-900/30 dark:to-cyan-900/30 animate-gradient-shift"></div>
      
      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-blue-500/25 dark:bg-blue-400/30 rounded-full blur-3xl animate-float-orb"></div>
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-cyan-500/25 dark:bg-cyan-400/30 rounded-full blur-3xl animate-float-orb-reverse"></div>
      <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-purple-500/25 dark:bg-purple-400/30 rounded-full blur-2xl animate-float-orb-slow"></div>
      
      {/* Subtle Grid/Particles */}
      <div className="absolute inset-0 opacity-40 dark:opacity-35" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59,130,246,0.35) 1px, transparent 0)`,
        backgroundSize: '35px 35px'
      }}></div>
      
      {/* Additional Accent Particles */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20" style={{
        backgroundImage: `radial-gradient(circle at 20px 30px, rgba(6,182,212,0.4) 2px, transparent 0)`,
        backgroundSize: '80px 80px'
      }}></div>
    </div>
  );
};

export default function Home() {

  // Get counting values with persistence
  const displayUsers = useCountAnimation(50, 1800, (v) => `${v}+`, 'users');
  const displayDepts = useCountAnimation(5, 1500, (v) => `${v}+`, 'depts');
  const displayPercent = useCountAnimation(100, 1800, (v) => `${v}%`, 'percent');

  const stats = [
    { value: displayUsers, label: "Active Users" },
    { value: displayDepts, label: "Government Departments" },
    { value: displayPercent, label: "Verification Accuracy" },
  ];

  return (
    <ContentPageShell>
      <section className="home-hero relative overflow-hidden" aria-labelledby="home-hero-title">
        {/* Animated Background */}
        <AnimatedBackground />

        <div className="home-hero__inner relative z-10">
          <TypingText />
          
          <div className="home-hero__rule" aria-hidden />

          <p className="home-hero__subtitle">
            The Galiyat Development Authority Document Verification System ensures every official
            document is uniquely identified, barcode-authenticated, and instantly verifiable —
            protecting citizens and institutions alike.
          </p>

          <div className="home-hero__actions">
            <Link href="/verify" className="home-btn-primary">
              <ScanLine aria-hidden />
              Verify Document
              <ArrowRight aria-hidden />
            </Link>
            <p className="home-hero__note">
              <ShieldCheck aria-hidden />
              No login required for public document verification
            </p>
          </div>

          <div className="home-stats" role="list" aria-label="System metrics">
            {stats.map((stat) => (
              <div key={stat.label} className="home-stats__item" role="listitem">
                <div className="home-stats__value">{stat.value}</div>
                <div className="home-stats__label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="home-section-divider">
        <GetInTouch />
      </div>
    </ContentPageShell>
  );
}
