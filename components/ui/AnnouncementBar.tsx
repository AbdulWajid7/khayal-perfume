const messages = [
  "Complimentary shipping on all orders above ₹15,000",
  "New — Sandalwood Nocturne now available",
  "Sample sets ship in 48 hours",
  "Handcrafted in small batches",
];

export default function AnnouncementBar() {
  const loop = [...messages, ...messages];

  return (
    <div className="fixed top-0 left-0 right-0 z-[51] h-8 bg-cream-dark border-b border-border overflow-hidden">
      <div className="flex h-full items-center whitespace-nowrap animate-marquee">
        {loop.map((message, index) => (
          <span
            key={`${message}-${index}`}
            className="text-ink text-[11px] font-medium tracking-[0.15em] uppercase px-10"
          >
            <span className="text-gold mr-2">✦</span>
            {message}
          </span>
        ))}
      </div>
    </div>
  );
}
