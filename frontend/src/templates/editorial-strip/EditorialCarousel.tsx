"use client";

import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { editorialStripConfig as cfg } from "./config";

export function EditorialCarousel({
  children,
  autoplayEnabled
}: {
  children: ReactNode;
  autoplayEnabled: boolean;
}) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const onChange = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const autoplayPlugin = useRef(
    Autoplay({
      delay: cfg.motion.autoplayDelayMs,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      playOnInit: true
    })
  );

  const plugins = useMemo(
    () => (autoplayEnabled && !prefersReducedMotion ? [autoplayPlugin.current] : []),
    [autoplayEnabled, prefersReducedMotion]
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      containScroll: false,
      dragFree: false,
      skipSnaps: false,
      duration: 38
    },
    plugins
  );

  useEffect(() => {
    if (!emblaApi || !autoplayEnabled) {
      return;
    }
    autoplayPlugin.current.play();
    return () => {
      autoplayPlugin.current.stop();
    };
  }, [autoplayEnabled, emblaApi]);

  return (
    <div ref={emblaRef} className="h-full overflow-hidden">
      <div className="flex h-full touch-pan-y">{children}</div>
    </div>
  );
}
