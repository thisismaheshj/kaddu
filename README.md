# kaddu — Packers & Movers client onboarding

A multi-step intake wizard that collects everything needed to build a moving company's website, Google Business Profile, social profiles, directory listings, SEO pages, Google/Meta ads, WhatsApp Business and marketing assets.

React + TypeScript + Vite. No UI framework; the design system is in `src/styles.css`.

## Run

```bash
npm install
npm run dev
```

`npm run build` outputs a static site to `dist/` that can be hosted anywhere (Vercel, Netlify, S3).

## How it works

- **Questions are data.** Every step, section and field is declared in `src/data/steps.ts`. Each field has a `type` (select, multiselect, chips, cards, radio, yesno, platform, repeater, file, …) and an optional `showIf` condition. The same definitions drive rendering, validation, completion tracking and the Review screen. To add, remove or reword a question, edit that file only.
- **Conditional logic.** `showIf` hides irrelevant questions (e.g. website URL only when Website = Yes, ad metrics only when they have advertised before, one detail panel per selected service).
- **"Other" options.** Set `other: true` on a select, chips, cards or radio field; picking Other reveals a text input.
- **Persistence.** Answers autosave to `localStorage`; uploads are stored in IndexedDB, so a refresh loses nothing. "Start over" clears both.
- **Submission.** A unique ID (`PM-YYYYMMDD-XXXX-XXXX`) is generated on submit. Uploads go to the private Supabase bucket `intake-files` under `<submission ID>/<field>/`, and one row is added to the `intake_submissions` table. The browser's public key can only insert — it cannot read, list or change anything. Without Supabase settings, submissions stay in the browser.
- **Safety.** No field asks for passwords, OTPs, card or banking details or API keys. Text inputs show a warning if something that looks like one is typed.

## Where responses go

Supabase project **BlocksFund** (`eviuvbkgmlriipwymtex`):

- **Table** `public.intake_submissions` — one row per submission: `submission_id`, `submitted_at`, `brand_name`, `contact_name`, `email`, `phone`, `data` (every raw answer), `summary` (readable label/value pairs by section) and `files` (uploaded file paths).
- **Storage** bucket `intake-files` (private, 50 MB per file) — one folder per submission ID.

View them in the Supabase dashboard (Table Editor → `intake_submissions`, Storage → `intake-files`). Configuration is read from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` — locally from `.env.local`, and in the deploy from the GitHub repository variables.

## Deploy

Every push to `main` builds and publishes to GitHub Pages: https://thisismaheshj.github.io/kaddu/

## Structure

```
src/
  data/steps.ts        all 12 steps and their fields
  data/geo.ts          countries, Indian states/UTs and cities, dial codes
  lib/schema.ts        visibility, validation, completion, value formatting
  lib/store.tsx        form state + localStorage autosave
  lib/files.ts         IndexedDB file storage
  lib/submit.ts        review summary, submission, JSON export
  components/          Field renderer, Combobox, FileDrop, Review, Success
  App.tsx              layout, step navigation, progress
```

The product name in the header is set by `BRAND` in `src/App.tsx`.
