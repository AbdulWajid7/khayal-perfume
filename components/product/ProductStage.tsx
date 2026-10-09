"use client";

/**
 * Product page stage: a large image on a soft gold halo with a hover zoom lens
 * and a thumbnail rail. Products with a real 3D model (The Gentleman) also get
 * a "360°" tab that shows the bottle in three.js, which visitors drag to turn.
 */
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { ShopifyImage } from "@/types/product";
import type { KhayalScene } from "@/components/three/khayalScene";

interface Props {
  images: ShopifyImage[];
  title: string;
  /** Show the 3D bottle tab (only for products that have a real 3D model). */
  has3d?: boolean;
  badge?: string;
}

function Bottle360() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<KhayalScene | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let rot = 0, vel = 0, dragging = false, lastX = 0, spin = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const coast = () => {
      if (dragging || Math.abs(vel) < 0.0005) return;
      vel *= 0.94; rot += vel; sceneRef.current?.setDragRotation(rot);
      spin = requestAnimationFrame(coast);
    };
    const down = (e: PointerEvent) => { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); cancelAnimationFrame(spin); };
    const move = (e: PointerEvent) => { if (!dragging) return; vel = (e.clientX - lastX) * 0.012; lastX = e.clientX; rot += vel; sceneRef.current?.setDragRotation(rot); };
    const up = () => { dragging = false; spin = requestAnimationFrame(coast); };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);

    import("@/components/three/khayalScene").then(({ createKhayalScene }) => {
      if (disposed) return;
      sceneRef.current = createKhayalScene(canvas, {
        stationIds: ["n360", "n360"],
        getProgress: () => 0,
        labelMarkUrl: "/images/khayal-mark-silver.png",
        labelFont: getComputedStyle(document.body).fontFamily || "sans-serif",
        reducedMotion: reduce,
        // centred bottle with golden trails and smoke, no other effects
        override: { x: 0, y: -0.05, s: 0.78, r: 0, z: 0, beams: 0.4, motes: 0.7, floor: 0.6, trails: 1, smoke: 0.7, leaves: 0, swirl: 0, orbit: 0, spray: 0, capOff: 0, pour: 0 },
      });
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(spin);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing touch-pan-y" aria-label="3D bottle, drag to rotate" role="img" />
      <p className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-stone whitespace-nowrap">
        Drag to rotate · 360°
      </p>
    </>
  );
}

export default function ProductStage({ images, title, has3d = false, badge }: Props) {
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<"photo" | "3d">("photo");
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const img = images[active];

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  }

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {/* thumbnail rail */}
      {(images.length > 1 || has3d) && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar md:flex-col md:overflow-visible md:w-20 shrink-0" role="tablist" aria-label="Product views">
          {images.map((im, i) => (
            <button
              key={im.url + i}
              type="button"
              role="tab"
              aria-selected={mode === "photo" && i === active}
              onClick={() => { setMode("photo"); setActive(i); }}
              aria-label={`View image ${i + 1} of ${title}`}
              className={[
                "relative aspect-square w-16 md:w-20 shrink-0 overflow-hidden rounded-xl border transition-all duration-300",
                mode === "photo" && i === active ? "border-gold shadow-[0_8px_20px_-10px_rgba(191,161,95,0.8)]" : "border-border opacity-70 hover:opacity-100 hover:border-gold/50",
              ].join(" ")}
            >
              <Image src={im.url} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
          {has3d && (
            <button
              type="button"
              role="tab"
              aria-selected={mode === "3d"}
              onClick={() => setMode("3d")}
              className={[
                "relative grid aspect-square w-16 md:w-20 shrink-0 place-items-center rounded-xl border bg-pure text-center transition-all duration-300",
                mode === "3d" ? "border-gold text-gold shadow-[0_8px_20px_-10px_rgba(191,161,95,0.8)]" : "border-border text-stone hover:border-gold/50 hover:text-ink",
              ].join(" ")}
            >
              <span className="font-serif-display text-lg leading-none">360°</span>
              <span className="absolute bottom-1.5 text-[8px] uppercase tracking-[0.2em]">3D</span>
            </button>
          )}
        </div>
      )}

      {/* stage */}
      <div className="relative flex-1">
        <div className="pointer-events-none absolute -inset-6 rounded-[40px] bg-[radial-gradient(55%_50%_at_50%_45%,rgba(191,161,95,0.22),transparent_70%)]" aria-hidden="true" />
        <div
          className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] border border-border bg-cream-dark"
          onMouseMove={mode === "photo" ? onMove : undefined}
          onMouseLeave={() => setZoom(null)}
        >
          {mode === "3d" ? (
            <>
              <div className="hero-mist" aria-hidden="true" />
              <Bottle360 />
            </>
          ) : img ? (
            <div key={img.url} className="absolute inset-0 kx-fade-up">
              <Image
                src={img.url}
                alt={img.altText || title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-300 ease-out"
                style={zoom ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
              />
            </div>
          ) : (
            <div className="h-full w-full bg-cream-dark" aria-hidden="true" />
          )}
          {badge && (
            <span className="absolute top-4 left-4 bg-gold text-pure text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-md font-medium">{badge}</span>
          )}
          {mode === "photo" && img && (
            <span className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-pure/80 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-stone backdrop-blur-sm max-md:hidden">
              Hover to zoom
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
