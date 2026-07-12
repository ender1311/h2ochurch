"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function Carousel({ images }: { images: string[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % images.length), 4500);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <div className="relative">
      <div className="relative aspect-square overflow-hidden rounded-lg shadow-2xl">
        {images.map((src, idx) => (
          <Image
            key={src}
            src={src}
            alt="H2O community"
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className={`object-cover transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0"}`}
            priority={idx === 0}
          />
        ))}
      </div>
      <div className="mt-5 flex justify-center gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Slide ${idx + 1}`}
            onClick={() => setI(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              idx === i ? "w-8 bg-brand" : "w-2.5 bg-ink/20 hover:bg-ink/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
