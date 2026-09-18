# KHAYAL Motion Design System

## Character

Motion is restrained, directional and product-led. Editorial reveals use a slow deliberate cadence; controls respond quickly. Bounce, elastic easing, aggressive zoom, random particles and permanent movement are excluded.

## Tokens

Tokens live in `lib/motion.ts`:

- Instant: 180 ms
- Fast controls: 280 ms
- Base reveals: 550 ms
- Slow editorial movement: 900 ms
- Cinematic image resolution: 1200 ms
- Standard easing: `[0.22, 1, 0.36, 1]`
- Responsive easing: `[0.4, 0, 0.2, 1]`
- Stagger: 60/100/160 ms
- Reveal distance: 24 px
- Default parallax strength: 10%
- Hover scale: 1.025
- Page transition: 280 ms

## Primitives

- `MotionProvider`: global Framer `MotionConfig` with `reducedMotion="user"`.
- `Reveal` and `RevealMask`: existing one-time editorial reveals.
- `StaggerGroup`: consistent grouped reveal and exported item variant.
- `Parallax`: image-only scroll transform with reduced-motion fallback.
- `ScrollProgress`: visual progress for bounded story sections.
- `PageTransition`: fast transform transition without an initial opacity gate.
- `.btn-premium-solid` and `.btn-premium-ghost`: restrained responsive CTAs.

## Rules

- Essential copy exists in semantic HTML and remains visible before hydration.
- Animate transform, opacity and filter; avoid repeated layout properties.
- Continuous motion is limited to bounded atmospheric light and stops under reduced motion.
- Scroll events are not used for analytics; Intersection Observer emits start/completion once.
- Mobile uses normal vertical flow; desktop sticky sections never take over the whole page.
- Focus, cart, checkout and navigation remain immediately interactive.

## Reduced motion

The global Framer boundary follows the operating-system preference. The CSS reduced-motion query disables CSS animation and transition duration, parallax components remove transforms, sticky storytelling becomes ordinary stacked content, and all information appears without choreography.
