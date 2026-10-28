# CivicEase AI

**Government services, simplified for everyone.**

CivicEase AI is a hackathon prototype for Engage 6.0 — Better Communities, Better Governance. It helps people understand government notices, prepare for common application processes, and organize civic complaints in one simple interface.

> **Important:** CivicEase AI is a prototype. Its checklists are illustrative, and complaint tracking is a local demo. It does not submit applications or send complaints to government authorities.

## Features

- **Document Explainer:** Organizes a notice into a summary, important dates, eligibility, documents, and next steps. Supporting quotes are checked against the notice; interpretations should be verified. English and Hindi explanations use the live AI endpoint. If AI is unavailable, a rule-based fallback selects existing sentences and is **not AI**.
- **Application Checklist:** Illustrative templates for scholarships, senior-citizen pensions, and water connections. Progress is saved in the current browser.
- **Complaint Tracker:** Create and update demo complaints. Records are stored locally and statuses are simulated.
- **Insights Dashboard:** Shows breakdowns based on demo complaint records in the current browser, not real-world statistics.

## Tech stack

- React 18, Vite 5, Tailwind CSS 3, Lucide React
- Vercel serverless function for the AI endpoint
- Google Gemini API for document explanations

## Run locally

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
npm run build
npm run preview
```

The Vite development server alone does not run Vercel serverless functions. To test the live AI endpoint locally, install/use the Vercel CLI and run:

```bash
npx vercel dev
```

Create an API key at [Google AI Studio](https://aistudio.google.com/) and configure `GEMINI_API_KEY` in a local, untracked environment file or through the Vercel CLI's environment setup. Do not commit the key.

## Configure live AI on Vercel

The serverless handler is `api/explain.js`. It calls the Google Gemini API. The API key must stay on the server.

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes, for live AI | Secret key from Google AI Studio; server-side only |
| `GEMINI_MODEL` | No | Model override; default is `gemini-3.5-flash-lite` |
| `VITE_AI_ENDPOINT` | No | Optional frontend endpoint override; not a secret |

**Never put the API, key in a `VITE_*` variable, frontend code, or GitHub.** Vite exposes `VITE_*` variables to browser code.

The endpoint limits notice input to 8,000 characters, uses a request timeout and a best-effort per-instance rate limit, and does not log notice text. These measures are prototype-level safeguards, not production-grade abuse prevention. If AI fails, the app reports the error and falls back to rule-based extraction. Always check the result against the original notice.

## Deploy on Vercel

1. Open [Vercel](https://vercel.com/) and import this repository.
2. In the project, open **Settings → Environment Variables**.
3. Add `GEMINI_API_KEY` with the API key from Google AI Studio. Select **Production** and **Preview** (and **Development** if needed).
4. Optionally add `GEMINI_MODEL` with value `gemini-3.5-flash-lite` to override the default.
5. Save the variables and trigger a **new deployment** so the settings take effect.
6. Open the deployed site, visit **Document Explainer**, paste a real notice (remove personal details), and run the explanation. Verify it is using live AI rather than the fallback.

The included `vercel.json` keeps API routes separate from the single-page app rewrite.

## Netlify

The frontend can be built using `npm run build` and published from `dist`. The API function in this repository targets Vercel, so live AI will not work on Netlify without adapting the function to Netlify's serverless format. The frontend may still use the rule-based fallback.

## Suggested demo flow

1. Explain the included/sample government notice.
2. Compare the extracted details with the original notice.
3. Open **Application Checklist**, tick a few items, and show progress.
4. Create a demo streetlight or road-damage complaint in **Complaint Tracker** and advance its simulated status.
5. Open **Insights Dashboard** to show counts and breakdowns based on local demo data.

## Limitations and responsible use

- This is a hackathon prototype, not an official government service.
- No government portal, complaint system, or application database is integrated.
- Complaint records and checklist progress remain in the current browser.
- Checklist templates are illustrative and are not verified official requirements.
- Source links supplied by users are not automatically authenticated.
- AI may be wrong or incomplete. Confirm deadlines, eligibility, documents, and fees with the issuing department.
- Do not paste sensitive personal information into the demo.

## Project details

- **Project:** CivicEase AI 
- **Hackathon:** Engage 6.0
- **Theme:** Better Communities, Better Governance
- **Team:** Ctrl Alt Elite
