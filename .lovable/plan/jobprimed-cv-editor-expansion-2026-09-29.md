# JobPrimed CV Editor Expansion

## Goal
Transform `/builder` into a complete CV editing, template-selection, and checkout experience inspired by Kickresume’s workflow, while retaining JobPrimed’s identity and using original template designs.

## What will change
- Replace the step-by-step form with a desktop editor workspace: section navigator, focused editing panel, and persistent CV preview.
- Add section cards for personal details, profile, work experience, education, skills, strengths, projects, languages, courses, and references.
- Add reorder, show/hide, add-entry, delete-entry, and completion states where appropriate.
- Add a template gallery with several original JobPrimed CV layouts and live switching.
- Mark selected layouts and tools as Pro with clear lock badges and an upgrade path.
- Add a checkout dialog for JobPrimed Pro using the existing ₦4,500/month offer; it will demonstrate the purchase flow without processing real payments.
- Add preview controls for zoom, page navigation, template choice, and download. Free templates remain downloadable; Pro templates open checkout.
- Preserve a focused mobile experience by switching between editor and preview views.

## Original design direction
- Match the reference product’s efficient three-pane information architecture and dense editor rhythm.
- Keep JobPrimed’s coral, warm paper, mint, and near-black visual identity.
- Create original ATS-friendly templates rather than copying Kickresume’s proprietary templates, names, artwork, or exact styling.

## Technical notes
- Keep the interactive editor isolated at `/builder` and leave public pages in shared site components.
- Extend the CV data model and preview component to support multiple layouts and repeated entries.
- Keep all state in the browser for this version; no account, saved documents, or real billing will be added.
- Verify the editing, template lock, checkout, mobile preview, and download paths in the running site.
