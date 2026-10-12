import { scentMood } from "@/lib/scent-moods";

/**
 * A cinematic poster for a fragrance that has no photograph yet: its own colour mood,
 * drifting light, the gold خیال mark and the notes as words. No bottle is drawn
 * (only real photos may show a KHAYAL bottle).
 */
export default function ScentPoster({
  handle,
  name,
  line,
  size = "card",
}: {
  handle: string;
  name: string;
  line?: string;
  size?: "card" | "hero";
}) {
  const mood = scentMood(handle);
  const hero = size === "hero";
  return (
    <div
      className="kh-poster absolute inset-0 overflow-hidden"
      style={
        {
          "--deep": mood.deep,
          "--mid": mood.mid,
          "--accent": mood.accent,
          background: `radial-gradient(120% 90% at 50% 110%, ${mood.mid} 0%, ${mood.deep} 62%)`,
        } as React.CSSProperties
      }
    >
      <span aria-hidden="true" className="kh-poster-glow" />
      <span aria-hidden="true" className="kh-poster-glow kh-poster-glow--2" />
      <span
        aria-hidden="true"
        className={`kh-mark absolute left-1/2 top-[14%] -translate-x-1/2 opacity-[0.16] ${hero ? "h-[62%]" : "h-[58%]"}`}
        style={{ color: mood.accent }}
      />
      <div aria-hidden="true" className="absolute inset-0">
        {mood.motes.map((m, i) => (
          <span
            key={m}
            className="kh-mote absolute font-serif-display italic"
            style={{
              color: mood.accent,
              left: `${12 + ((i * 31) % 62)}%`,
              top: `${18 + i * 17}%`,
              animationDelay: `${i * 2.3}s`,
              fontSize: hero ? 22 : 15,
            }}
          >
            {m}
          </span>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6 text-center" style={{ color: mood.accent }}>
        <span className="block text-[10px] uppercase tracking-[0.42em] opacity-70">KHAYAL · Extrait de parfum</span>
        <span className={`mt-2 block font-serif-display tracking-[0.1em] text-[#faf6ef] ${hero ? "text-5xl" : "text-3xl"}`}>
          {name}
        </span>
        {line && <span className={`mt-2 block font-serif-display italic opacity-85 ${hero ? "text-xl" : "text-sm"}`}>{line}</span>}
      </div>
    </div>
  );
}
