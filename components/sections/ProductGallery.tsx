"use client";

import { useState } from "react";
import Image from "next/image";
import type { ShopifyImage } from "@/types/product";

export default function ProductGallery({
  images,
  title,
}: {
  images: ShopifyImage[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  return (
    <div>
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream-dark">
        {activeImage ? (
          <Image
            src={activeImage.url}
            alt={activeImage.altText || title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-5">
            <span aria-hidden="true" className="kh-mark h-40 text-aubergine opacity-20" />
            <span className="text-[11px] uppercase tracking-[0.3em] text-stone">Photograph coming</span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={image.url + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1} of ${title}`}
              className={[
                "relative aspect-square overflow-hidden border transition-colors",
                index === activeIndex ? "border-ink" : "border-border hover:border-ink/50",
              ].join(" ")}
            >
              <Image
                src={image.url}
                alt={image.altText || `${title} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
