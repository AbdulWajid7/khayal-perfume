export const motionTokens = {
  duration: {
    instant: 0.18,
    fast: 0.28,
    base: 0.55,
    slow: 0.9,
    cinematic: 1.2,
  },
  ease: {
    standard: [0.22, 1, 0.36, 1] as const,
    responsive: [0.4, 0, 0.2, 1] as const,
  },
  stagger: {
    tight: 0.06,
    base: 0.1,
    editorial: 0.16,
  },
  revealDistance: 24,
  parallaxStrength: 10,
  hoverScale: 1.025,
  blur: 10,
  pageTransitionDuration: 0.28,
} as const;
