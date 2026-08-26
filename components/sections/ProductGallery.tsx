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
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border bg-cream-dark">
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
          <div className="h-full w-full bg-cream-dark" aria-hidden="true" />
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={image.url + index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1} of ${title}`}
              className={[
                "relative aspect-square overflow-hidden rounded-xl border transition-colors",
                index === activeIndex ? "border-gold" : "border-border hover:border-gold/50",
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
