# KHAYAL Premium Motion Audit

## Current stack

- Next.js 15 App Router, React 19, TypeScript and server-rendered route components.
- Tailwind CSS v4 with brand tokens in `app/globals.css`.
- MongoDB/Mongoose product and journal data; public commerce pages render dynamically.
- Next Image produces AVIF/WebP and responsive sources.
- Framer Motion powers UI reveals, page transitions, drawers and scroll transforms.
- Lenis currently smooths public-page scrolling.
- GSAP, Three.js, React Three Fiber and Drei are installed, but GSAP is unused and the two procedural Three scenes are not mounted.
- Direct GA4 and Meta integrations plus GTM and Clarity are centralized in the analytics provider.

## Current experience weaknesses

- The visual system is light ivory/gold while the intended direction is near-black, deep purple, champagne and soft ivory.
- The homepage reads as a sequence of similarly structured sections rather than a directed narrative.
- There is no centrally configured campaign surface or featured-product composition.
- Product detail is a conventional two-column page; scent information is not presented as a journey.
- Mongo products do not currently persist scent-note, occasion, season, intensity or visual-palette fields, so storytelling data is often absent.
- Men/Women/Unisex links use query parameters that the collection route does not currently filter.
- The search icon has no behavior.
- Full-screen load and page opacity transitions can delay visible content and LCP.
- Lenis affects all public scrolling, although most interactions do not require scroll smoothing.
- Several Framer components do not explicitly honor reduced motion; overlays lack complete focus management.
- Product quick-add is hover-led and needs an always-visible touch fallback.

## Reusable components

- `ProductCard`, `AddToCartButton`, `ProductGallery`, `ProductPurchasePanel`, `CartDrawer` and cart context.
- `Reveal`, `RevealMask`, `Parallax` and `PageTransition`, after consolidation into one motion system.
- SEO schema, metadata, sitemap, robots and analytics components.
- Genuine in-use brand imagery: `homepage.png`, `brand-story.png`, `category-men.png`, `category-women.png`, `category-unisex.png`, `logo.png` and `og-image.jpg`.

## Components requiring redesign

- Navigation and mobile drawer.
- Announcement/campaign presentation.
- Homepage hero and section sequencing.
- Category showcase and featured-product section.
- Product-detail content architecture.
- Scent Finder explanation, session persistence and analytics.
- Journal cards, trust section and footer hierarchy.
- Page transition and initial-load behavior.

## Technology selection

- Framer Motion remains the primary library for route transitions, component presence, stagger and scroll-linked transforms.
- Native CSS handles hover, focus, light sweep and simple transitions.
- Intersection Observer handles one-time story analytics without continuous scroll events.
- GSAP is not required: Framer Motion can deliver the controlled sticky story without adding another runtime animation engine.
- Lenis should be removed from the public shell to retain native scrolling, restoration, anchors and mobile behavior.
- Three.js will not be used. No approved GLB/GLTF exists; the existing procedural bottle and particle mist do not represent a real KHAYAL product.

## Performance risks

- Initial opacity gates from `LoadIntro`, `PageTransition` and hero entrance motion can delay LCP.
- Four analytics integrations add third-party work; Clarity should remain asynchronous and essential content must not depend on them.
- Every public commerce request currently reaches MongoDB; cached/revalidated reads are a future TTFB improvement.
- Unused Three/GSAP/Sanity/Shopify dependencies increase install surface, although tree shaking keeps most out of public bundles.
- Remote product image dimensions are not persisted, limiting ideal intrinsic sizing.

## Asset gaps

- No authentic GLB/GLTF bottle model.
- No approved transparent PNG/WebP/AVIF bottle cutouts for individual products.
- MongoDB product images have URLs but no stored alt text, dimensions or presentation metadata.
- No verified product-specific palette, light direction, day/night, season or intensity fields.
- Journal posts may lack approved cover photography.

## Mobile and fallback strategy

- Use native vertical flow and short transforms; no scroll hijacking or desktop-length pinning.
- Product purchase controls remain above the story and a compact add-to-cart action remains reachable.
- Category cards expose all copy without hover.
- Sticky story becomes stacked semantic sections below desktop breakpoint.
- Framer `MotionConfig reducedMotion="user"` plus CSS reduced-motion rules shows content immediately and removes parallax, continuous movement and pin-like choreography.
- All imagery keeps a static poster/fallback; all essential copy remains HTML.

## Implementation phases

1. Motion tokens and accessibility boundary.
2. Dark global public-shell treatment and navigation.
3. Configured campaign and cinematic hero.
4. Homepage brand story, collections, featured product and trust.
5. Real-data product scent journey and conversion endpoint.
6. Product cards, scent finder, journal and footer.
7. Analytics, reduced-motion, performance and multi-viewport validation.
