<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep JobPrimed’s public experience in reusable shared site components, with the interactive CV editor isolated at `/builder`, so marketing and product workflows stay independently maintainable.
- Model builder monetization as explicit free/Pro capabilities in the `/builder` UI, with payment processing remaining a separate integration, so access states never imply a live charge.
- CV templates and sample content live as data in `src/lib/templates.ts`, rendered by one `ResumePreview` with six layouts, so new templates need no new components.
- Prices are defined in USD and converted to NGN via `USD_TO_NGN` at checkout, so display and charge currency stay in one place.
- Editor drafts autosave to localStorage and PDFs are generated client-side (html2canvas-pro + jspdf) from a hidden A4 render.
