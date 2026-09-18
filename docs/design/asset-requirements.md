# KHAYAL Premium Motion Asset Requirements

| Required asset | Product/section | Status | Format | Recommended dimensions | Transparent background | Mobile version | 3D |
|---|---|---|---|---:|---|---|---|
| Hero collection photograph | Homepage hero | Existing: `homepage.png` | AVIF/WebP source preferred | 2400×1600+ | No | Separate 1200×1600 crop preferred | Not required |
| Campaign photograph | Campaign banner | Existing hero image can be used initially | AVIF/WebP source preferred | 2400×1200+ | No | 1200×1500 preferred | Not required |
| Brand atelier photograph | Brand story | Existing: `brand-story.png` | AVIF/WebP source preferred | 1800×1800+ | No | Responsive crop sufficient | Not required |
| Men collection photograph | Men panel | Existing: `category-men.png` | AVIF/WebP source preferred | 1400×1800+ | No | Existing portrait crop | Not required |
| Women collection photograph | Women panel | Existing: `category-women.png` | AVIF/WebP source preferred | 1400×1800+ | No | Existing portrait crop | Not required |
| Unisex collection photograph | Unisex panel | Existing: `category-unisex.png` | AVIF/WebP source preferred | 1400×1800+ | No | Existing portrait crop | Not required |
| Product primary image | Every SKU | Database-dependent | PNG/WebP/AVIF | 1600×2000+ | Preferred for 2.5D | Same source acceptable | Optional |
| Product secondary image | Every SKU | Database-dependent | WebP/AVIF | 1600×2000+ | No | Same source acceptable | Not required |
| Transparent bottle cutout | Featured product and scent journey | Missing | Transparent PNG/WebP/AVIF | 1600×2400+ | Required | 1000×1500 optimized derivative | Optional |
| Product lifestyle/story image | PDP story | Missing as explicit field | WebP/AVIF | 2000×1400+ | No | 1200×1500 crop preferred | Not required |
| Approved atmospheric texture | PDP configured palette | Missing | WebP/AVIF | 1600×1600 | Optional | Lower-resolution version | Not required |
| Authentic bottle model | Optional future 3D | Missing | Compressed GLB/GLTF | Under 2 MB target | N/A | Static poster mandatory | Optional, never required |
| Journal cover images | Editorial cards/articles | Database-dependent | WebP/AVIF | 1600×1000+ | No | Responsive crop sufficient | Not required |
| Social share image | Site metadata | Existing: `og-image.jpg` | JPG/WebP | 1200×630 | No | No | Not required |

## Model acceptance criteria

A future GLB/GLTF must be generated from or approved against the real product, preserve exact bottle proportions and label artwork, include optimized geometry and compressed textures, and ship with an approved static product poster. The current procedural Three.js bottle is not acceptable as product representation.
