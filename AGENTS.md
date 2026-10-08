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
- CV templates and editorial sample enrichment live as data in `src/lib/templates.ts`, rendered by one `ResumePreview`; semantic background tokens and all layouts remain shared between gallery, editor and PDF.
- USD plan prices are quoted server-side in the billing market's currency; initialize only when the configured merchant reports that currency, so local payment rails are never assumed from customer location.
- Editor drafts autosave to localStorage; `src/lib/cv-pdf.ts` paginates the shared full-width render without stretching or clipping text, preserving visual proportions.
- All premium features are editable; list used premium capabilities at checkout/export and read time-limited purchases from authenticated `cv_entitlements`, never browser storage, so payment access cannot be forged by editing a local flag.
- Paystack verification checks the authenticated owner, reference, currency and initialized amount before idempotent entitlement creation; merchant country keys are isolated to server handlers.
