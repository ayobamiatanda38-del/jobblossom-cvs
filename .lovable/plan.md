# Transform JobPrimed into a CV curation platform

## Goal
Rebuild the current placeholder as a polished JobPrimed CV curation experience inspired by Kickresume’s clear structure, strong trust signals, resume-first visuals, and conversion flow—while retaining JobPrimed’s own name, voice, proof points, and original design identity.

## What will be built
- A responsive home page with a strong JobPrimed header, focused “build a CV” opening, trust proof, and a realistic CV preview.
- Clear product pathways for building a CV, checking ATS compatibility, tailoring applications, and preparing for interviews.
- A showcase of curated CV examples, a simple three-step process, testimonials, pricing prompt, FAQ, and a complete footer.
- Working interactions: mobile navigation, product tabs, CV example filters, FAQ expansion, and calls-to-action that lead into the builder experience.
- A functional guided CV builder at `/builder` with editable personal details, summary, experience, education and skills, plus a live CV preview and progress indicator.
- Distinct metadata for every page and strong mobile behavior matching the current phone-sized preview.

## Visual direction
- Warm off-white canvas, near-black typography, coral/orange primary action, fresh green accents, and soft blue secondary panels.
- Editorial typography with oversized confident headlines, restrained card radii, crisp borders, and real document-like CV previews.
- Layout rhythm and information hierarchy influenced by Kickresume, but no copied branding, text, imagery, or proprietary assets.

## Technical details
- Keep the existing TanStack Start structure and reusable UI controls.
- Define all colors, typography, spacing, shadows, and motion as semantic tokens in the global design system.
- Use local, original interface visuals built in React/CSS rather than hotlinked assets.
- Add route-level titles, descriptions, Open Graph fields, and Twitter card metadata.
- Verify the central builder flow and both mobile and desktop layouts in the running preview.
