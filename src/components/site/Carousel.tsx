"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { SitePhoto } from "@/lib/photos";

export function Carousel({ images }: { images: SitePhoto[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const next = useCallback(() => setI((p) => (p + 1) % images.length), [images.length]);
  const prev = useCallback(
    () => setI((p) => (p - 1 + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (paused || lightbox) return;
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [paused, lightbox, next]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, next, prev]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="group relative aspect-square overflow-hidden rounded-lg shadow-2xl">
        {images.map((photo, idx) => (
          <button
            key={photo.src}
            aria-label={`Enlarge photo: ${photo.scene}`}
            onClick={() => setLightbox(true)}
            className={`absolute inset-0 cursor-zoom-in transition-opacity duration-700 ${
              idx === i ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
              priority={idx === 0}
            />
          </button>
        ))}

        {/* Arrows */}
        <button
          aria-label="Previous photo"
          onClick={prev}
          className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate opacity-0 shadow-lg transition-all duration-300 hover:bg-white group-hover:opacity-100"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          aria-label="Next photo"
          onClick={next}
          className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate opacity-0 shadow-lg transition-all duration-300 hover:bg-white group-hover:opacity-100"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Scene caption */}
        <span className="absolute bottom-3 left-3 z-10 max-w-[60%] truncate rounded-full bg-charcoal/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {images[i].scene}
        </span>

        {/* Counter + zoom hint */}
        <span className="absolute bottom-3 right-3 z-10 rounded-full bg-charcoal/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {i + 1} / {images.length}
        </span>
      </div>

      {/* Dots */}
      <div className="mt-5 flex justify-center gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Go to slide ${idx + 1}`}
            aria-current={idx === i}
            onClick={() => setI(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              idx === i ? "w-8 bg-brand" : "w-2.5 bg-ink/20 hover:bg-ink/40"
            }`}
          />
        ))}
      </div>

      {/* Lightbox */}
      {lightbox ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-charcoal/95 p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            aria-label="Close viewer"
            onClick={() => setLightbox(false)}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
          <button
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="relative h-[82vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[i].src}
              alt={images[i].alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <button
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white">
            {i + 1} / {images.length}
          </span>
        </div>
      ) : null}
    </div>
  );
}
