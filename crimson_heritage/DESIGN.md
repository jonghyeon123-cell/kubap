---
name: Crimson Heritage
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#564242'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#897172'
  outline-variant: '#dcc0c0'
  surface-tint: '#a23b47'
  primary: '#670d1e'
  on-primary: '#ffffff'
  primary-container: '#862633'
  on-primary-container: '#ff9ea3'
  inverse-primary: '#ffb3b6'
  secondary: '#735c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed65b'
  on-secondary-container: '#745c00'
  tertiary: '#34332e'
  on-tertiary: '#ffffff'
  tertiary-container: '#4b4944'
  on-tertiary-container: '#bcb8b2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb3b6'
  on-primary-fixed: '#40000c'
  on-primary-fixed-variant: '#832331'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#e6e2db'
  tertiary-fixed-dim: '#cac6bf'
  on-tertiary-fixed: '#1c1c17'
  on-tertiary-fixed-variant: '#484742'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-padding: 20px
  gutter: 12px
---

## Brand & Style

The design system is engineered to evoke a sense of academic prestige, reliability, and modern efficiency. It balances the historic weight of the institution with a contemporary mobile-first experience. 

The aesthetic is **Modern Corporate** with a focus on **Tactile Minimalism**. It utilizes generous whitespace and large radii to create an approachable "friendly-premium" atmosphere. The interface avoids unnecessary visual noise, prioritizing clarity and trust for students and faculty. The visual language relies on high-quality typography and structured information hierarchy to communicate a "Gold Standard" in campus services.

## Colors

The palette is anchored by **Crimson Red**, the definitive symbol of the institution's heritage. This is paired with a **Warm Ivory** background to create a sophisticated, less aggressive reading environment than pure white. 

- **Primary (Crimson):** Reserved for high-importance actions, brand moments, and active states.
- **Secondary (Gold/Brass):** Used sparingly for "Premium" statuses, special menu highlights, or decorative accents to reinforce the academic aesthetic.
- **Neutrals:** A spectrum of warm grays ensures the interface feels cohesive and high-end. Use the **Border** color (#E5E1DA) for subtle structural separation without breaking the visual flow.

## Typography

This design system uses two distinct sans-serifs to manage hierarchy. **Plus Jakarta Sans** provides a bold, confident, and slightly rounded geometric feel for headings, ensuring the "Crimson Heritage" personality shines through. **Manrope** is used for body text due to its exceptional legibility and refined, professional character.

For Korean language implementation, pair these with a high-quality Gothic typeface (like Pretendard or Noto Sans KR) using the same weight and scale logic defined in the tokens. Maintain tight letter-spacing for headlines to preserve the "Premium" editorial look.

## Layout & Spacing

The layout follows a **Fluid Content Model** optimized for one-handed mobile use. 
- **Margins:** A standard horizontal safe-area margin of 20px is used for the main container.
- **Rhythm:** An 8px linear scale (4px for micro-adjustments) governs all spatial relationships.
- **Cards:** Content is grouped into large, distinct cards. Use 16px of vertical spacing between cards to maintain a "breathable" and organized aesthetic.
- **Section Headers:** Use 32px of top-padding to clearly demarcate different sections of the dining experience (e.g., Breakfast vs. Lunch).

## Elevation & Depth

Visual depth is achieved through **Soft Ambient Shadows** rather than harsh borders. This design system avoids "flat" design in favor of subtle dimensionality.

- **Surface Levels:** The Warm Ivory (#FAF7F2) is the base. Pure White (#FFFFFF) cards sit "above" this base.
- **Shadow Profile:** Shadows should be highly diffused. Example: `0px 4px 20px rgba(26, 26, 26, 0.06)`. This creates a soft lift that suggests the UI is physically layered.
- **Active State:** When a card or button is pressed, use a subtle "pressed" elevation (smaller shadow, slight scale down to 0.98) to provide tactile feedback.

## Shapes

The shape language is defined by **Generous Radii**. 
- **Standard Cards/Containers:** 16px (rounded-lg) is the default to convey friendliness and modernism.
- **Main Action Buttons:** Should use the 16px radius to match cards, or a full Pill-shape for distinct high-importance actions.
- **Selection Chips:** Use 12px or Pill-shaped for a tactile, "clickable" look.
- **Small Components:** Checkboxes and small inputs should use 6px-8px to maintain readability at smaller scales while still feeling "soft."

## Components

- **Primary Buttons:** Solid Crimson (#862633) with White text. Bold weight, 16px radius, height of 56px for optimal thumb-tap targets.
- **Dining Cards:** Pure White background, 16px radius, soft shadow. Should feature a "tag" in the top corner for status (e.g., "Open", "Crowded").
- **Status Chips:** Small, rounded elements used for allergens or meal types (e.g., Vegan, Halal). Use a light grey background (#E5E1DA) with dark text.
- **Navigation:** A bottom navigation bar with a blur effect (glassmorphism) over the ivory background. Icons should be "thin stroke" (1.5pt) to match the refined brand.
- **Input Fields:** Warm Ivory or Light Grey stroke (#E5E1DA) with a 12px radius. When focused, the stroke changes to Crimson.
- **Progressive Disclosure:** Use accordion-style lists for menu details, with smooth micro-animations to reinforce the "Premium" feel.