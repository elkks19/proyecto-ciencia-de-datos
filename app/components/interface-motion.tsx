"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { animate, stagger } from "animejs";

export function InterfaceMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) {
      return;
    }

    const reveals = animate(".warm-reveal", {
      opacity: { from: 0, to: 1 },
      y: { from: 18, to: 0 },
      duration: 680,
      delay: stagger(55),
      ease: "outQuad",
    });

    const cards = animate(".warm-card", {
      opacity: { from: 0, to: 1 },
      y: { from: 24, to: 0 },
      scale: { from: 0.985, to: 1 },
      duration: 720,
      delay: stagger(38),
      ease: "outCubic",
    });

    const bars = animate(".warm-bar-fill", {
      scaleX: { from: 0, to: 1 },
      transformOrigin: "left center",
      duration: 900,
      delay: stagger(35),
      ease: "outQuart",
    });

    return () => {
      reveals.revert();
      cards.revert();
      bars.revert();
    };
  }, [pathname]);

  return null;
}
