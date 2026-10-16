"use client";

import { useRef, useState } from "react";
import { uploadProductImage } from "@/lib/admin/product-images";

const MAX_SIDE = 2000;

/** Shrinks a photo in the browser to at most 2000 px on the long side, as a JPEG. */
async function shrink(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.fillStyle = "#ffffff"; // transparent PNGs get a white background
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.88));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}

/**
 * Photo manager for the product form: upload from the computer or phone, reorder, pick the
 * main photo, remove. Submits the final list as the "images" field (comma separated).
 */
export default function ProductImagesField({ initial = [], handle = "" }: { initial?: string[]; handle?: string }) {
  const [images, setImages] = useState<string[]>(initial.filter(Boolean));
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");
  const [pasted, setPasted] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    const list = Array.from(files);
    setBusy(list.length);
    for (const f of list) {
      try {
        const fd = new FormData();
        fd.set("file", await shrink(f));
        fd.set("handle", handle);
        const res = await uploadProductImage(fd);
        if (res.ok) setImages((prev) => [...prev, res.url]);
        else setError(`${f.name}: ${res.error}`);
      } catch {
        setError(`${f.name}: upload failed. Try again.`);
      }
      setBusy((n) => n - 1);
    }
    if (input.current) input.current.value = "";
  }

  const move = (i: number, to: number) =>
    setImages((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [x] = next.splice(i, 1);
      next.splice(to, 0, x);
      return next;
    });

  return (
    <fieldset className="border border-border rounded-xl p-4 space-y-4">
      <legend className="px-1 text-sm font-medium text-ink">Photos</legend>
      <input type="hidden" name="images" value={images.join(", ")} />

      {images.length > 0 ? (
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((url, i) => (
            <li key={url} className="border border-border rounded-lg overflow-hidden bg-cream">
              <div className="relative aspect-[4/5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-2 top-2 rounded bg-ink px-2 py-0.5 text-[10px] uppercase tracking-wider text-cream">
                    Main photo
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-2 py-2 text-xs">
                {i > 0 && (
                  <button type="button" onClick={() => move(i, 0)} className="text-gold hover:underline">
                    Make main
                  </button>
                )}
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="text-stone disabled:opacity-30" aria-label="Move left">
                  ←
                </button>
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === images.length - 1} className="text-stone disabled:opacity-30" aria-label="Move right">
                  →
                </button>
                <button type="button" onClick={() => setImages((p) => p.filter((u) => u !== url))} className="ml-auto text-sale hover:underline">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-stone">No photos yet. The first photo you add is the main one on the shop.</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer bg-ink text-pure rounded-lg px-4 py-2 text-sm font-medium hover:bg-gold transition-colors">
          {busy > 0 ? `Uploading ${busy}…` : "Upload photos"}
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={busy > 0}
            className="sr-only"
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>
        <span className="text-xs text-stone">JPG, PNG or WEBP. Large photos are resized automatically. Best shape: 4:5 portrait.</span>
      </div>
      {error && <p className="text-sm text-sale">{error}</p>}

      <details className="text-xs text-stone">
        <summary className="cursor-pointer">Add a photo by link instead</summary>
        <div className="mt-2 flex gap-2">
          <input value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder="https://… or /images/…" className="input-admin flex-1" />
          <button
            type="button"
            onClick={() => {
              const u = pasted.trim();
              if (u && !images.includes(u)) setImages((p) => [...p, u]);
              setPasted("");
            }}
            className="border border-border rounded-lg px-3 text-sm hover:bg-cream"
          >
            Add
          </button>
        </div>
      </details>
      <p className="text-xs text-stone">Changes to photos are kept when you press Save.</p>
    </fieldset>
  );
}
