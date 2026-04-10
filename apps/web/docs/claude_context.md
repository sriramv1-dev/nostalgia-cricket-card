# Project Context: Nostalgia Cricket Card (Dynamic Assets)

This document provides necessary technical context for Claude to assist in the development of the Nostalgia Cricket Card platform, specifically focusing on the dynamic pixel-manipulation engine.

## Tech Stack
- **Framework**: Next.js 16+ (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Core Engine**: HTML5 Canvas API (Pixel Manipulation)

## Key Components

### 1. `DynamicCharacter.tsx`
This is the core engine that handles real-time recoloring of a single-layer PNG character.

#### Core Logic: HSL Mapping
Unlike simple color multiplication, we use **HSL Mapping** to preserve shading:
1. Extract the **Lightness (L)** from the original pixel (this contains the shadows/highlights).
2. Extract the **Hue (H)** and **Saturation (S)** from the user-selected target color.
3. Construct a new RGB value using `Target H`, `Target S`, and `Original L`.
4. Result: High color fidelity while maintaining all 3D shading.

#### Spatial Partitioning (2D Masking)
Since the character sprite is a single flat image, we use a 2D coordinate system to distinguish separate parts that share colors:
- **X-Axis (`relX`)**: Determines horizontal position (0.0 = Left, 1.0 = Right).
- **Y-Axis (`relY`)**: Determines vertical position (0.0 = Top, 1.0 = Bottom).

**Current Threshold Regions:**
- **Bat**: `isYellow` && `relX > 0.65`
- **Cap Accent (Brim)**: `isYellow` && `relX <= 0.65`
- **Cap**: `isBlue` && `relY <= 0.35` && (everything not glove/pads)
- **Gloves**: `isBlue` && `relX > 0.6` && `relY > 0.35` && `relY <= 0.65`
- **Pads**: `isBlue` && `relY > 0.65`

### 2. `BrandCard.tsx`
The primary UI container for the "Limited Edition" card (750x1050px). It integrates the `DynamicCharacter` and provides the framing, logo, and background textures.

## Styling Tokens (Tailwind)
- **Backgrounds**: `bg-retro-grain` (custom texture opacity `0.15`).
- **Colors**: `bg-cream`, `text-slate-800`.
- **Shadows**: Large drop shadows are used on assets to create depth (`drop-shadow-[0_30px_50px_rgba(0,0,0,0.15)]`).

## Development Guidelines for Claude
- **Preserve Shading**: Never use flat color overlays. Always use the HSL Mapping approach in `DynamicCharacter`.
- **Canvas Lifecycle**: Ensure that `ImageData` is always cached as a "pristine" copy in a Ref to avoid cumulative rounding errors during rapid state updates.
- **Performance**: Use `requestAnimationFrame` for all pixel loops triggered by user inputs (color pickers).

---

*This file is generated and maintained as a sync point for parallel AI development. You can test these features at `/brand-side`.*
