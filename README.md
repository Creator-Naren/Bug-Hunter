# Bug Hunter — Static Security Auditor + Vulnerability Tracker (TypeScript + React + Firebase + Gemini)

## What this is
Bug Hunter is a local-first developer tool and web UI for scanning Python code with a structured AI security analysis, turning AI findings into draft bug reports, and tracking those reports alongside project target metadata. It pairs a React + Vite front-end with an Express/TypeScript server that calls Google Gemini (via @google/genai) for structured SAST-style output and persists workspace state in Firebase Firestore.

## Key capabilities
- Use Gemini to perform structured security analyses of Python code snippets and return JSON-formatted findings.
- Convert AI findings into draft vulnerability reports that can be reviewed, edited, and stored.
- Manage targets (projects/repositories) and link bug reports and methodology checklists to targets.
- Store historical analyses and support a developer-facing dashboard and sidebar system log stream.

## Stack
- **Languages:** TypeScript (frontend + backend), HTML/CSS, JSON for config and Firebase rules
- **Framework / runtime:** React (TSX) + Vite frontend; Express + Node TS backend (server.ts)
- **Notable libraries / integrations:**
  - React + Vite (frontend SPA)
  - Firebase / Firestore (persistence)
  - @google/genai (Gemini integration for structured analysis)
  - Tailwind-like utility classes observed in components (UI styling)
  - Express (server runtime)

## Repository layout (top-level)
```
App.tsx                 — main React application component (mounts the workspace)
index.tsx               — React entrypoint (renders App)
server.ts               — Express + Vite middleware server that calls Gemini for analysis
firebase.ts             — firebase initialization using firebase-applet-config.json
firebase.json           — firebase project config (deployment / hosting hints)
firebase-applet-config.json — local Firebase config used by firebase.ts
firestore.rules         — Firestore security rules (store with repo)
components/             — React UI components:
  Analyzer.tsx          — code analysis UI & integration to convert findings -> reports
  BugReports.tsx        — reports UI (create/edit/list)
  Dashboard.tsx         — overview and quick actions
  Sidebar.tsx           — navigation and system log feed
  Targets.tsx           — manage targets (projects/repositories)
services/                — services used by the app:
  db.ts                 — Firestore read/write wrappers and helpers (get/save/delete operations)
index.html              — SPA HTML shell
index.css               — app-wide CSS (global styles)
metadata.json           — app metadata (branding/version hints)
package.json            — npm metadata and dependencies (present in repo)
package-lock.json       — lockfile for exact dependency versions
tsconfig.json           — TypeScript configuration
vite.config.ts          — Vite + dev server configuration
types.ts                — TypeScript types/DTOs used across the app
```

## How it fits together
- Frontend (React + Vite) is a single-page app with several workspace tabs: dashboard, analyzer, targets, and reports. Main entry is App.tsx which pulls data from Firestore via service functions (services/db.ts) and navigates between components in the components/ folder.
- Backend (server.ts) exposes a POST /api/analyze endpoint. The backend builds a structured prompt and calls the Gemini API (via @google/genai) expecting JSON output matching an explicit schema (vulnerabilities array, overallSeverity, summary). In development mode the server spins up a Vite dev server as middleware so the same process serves the SPA and handles AI API calls.
- Persistence and auth: firebase.ts initializes Firestore using firebase-applet-config.json. services/db.ts implements CRUD for targets, bug_reports, checklists and code_analyses collections. Firestore security rules are included in firestore.rules.

## Quick start — development

### Requirements
- Node.js (recommended current LTS)
- A Firebase project with Firestore enabled
- A Google Gemini API key (stored in GEMINI_API_KEY environment variable, see notes)
- The file firebase-applet-config.json must be present and contain your Firebase app configuration (the repo includes a placeholder file name)

### Install dependencies
```bash
# from repository root
npm install
```

### Run the app for development
- The repository runs an Express TypeScript server (server.ts). In development the server mounts Vite as middleware and listens on port 3000. A single development server run should serve the frontend and provide the /api/analyze endpoint.

Example dev run (using ts-node-dev for TypeScript hot reload):
```bash
# If you don't have a script, a common approach:
npx ts-node-dev --respawn --transpile-only server.ts
# or, if the project provides npm scripts:
npm run dev
```

### Environment variables
- GEMINI_API_KEY — required. The server checks this variable and returns an error if not configured.
- NODE_ENV — set to production to serve pre-built frontend from dist/ (server.ts branches on NODE_ENV).
- If your Firebase project requires different defaults, add or update firebase-applet-config.json (the repo expects this file and firebase.ts imports it directly).

### Production build
1. Build the frontend with Vite:
   - If you have a build script: npm run build
   - Otherwise: npx vite build
2. Compile TypeScript (backend) and produce a production-ready server bundle (example):
```bash
# Compile TypeScript to dist/ (example)
npx tsc
# Start server from compiled output (server compiled to dist/server.js)
node dist/server.js
```
Server will serve static files from dist/ when NODE_ENV=production (see server.ts).

## API — /api/analyze
POST /api/analyze
- Request JSON:
  { "code": "<python source code to analyze as a string>" }
- Response JSON (structured; server expects the AI to match this schema):
  {
    "vulnerabilities": [
      {
        "type": "SQL Injection",
        "severity": "Critical" | "High" | "Medium" | "Low" | "Info",
        "lineNumber": 42,
        "description": "Why this is a vulnerability...",
        "recommendation": "How to fix it..."
      },
      ...
    ],
    "overallSeverity": "Critical" | "High" | "Medium" | "Low" | "None",
    "summary": "High-level summary"
  }

## Notes, configuration & operational guidance
- Gemini / @google/genai:
  - The server constructs a strict system instruction and configures the AI client to return JSON. Provide GEMINI_API_KEY in the environment on the server host. Be mindful of API usage/costs and of sending sensitive code to the cloud.
- Firestore:
  - The app expects Firestore collections: targets, bug_reports, checklists, code_analyses. services/db.ts uses ordering fields like createdAt / created_date; verify your documents include those fields for ordering to function as expected.
  - Update firestore.rules if you change authentication or data model assumptions.
- Security:
  - GEMINI_API_KEY must be kept secret — do not commit secrets in repo. The repository contains firebase-applet-config.json and firebase.json for configuration; ensure your own project credentials are stored securely and not checked into public repos.
  - The code includes an explicit error path if GEMINI_API_KEY is not configured — server returns 500 with a hint.
- Error handling:
  - services/db.ts wraps Firestore operations with structured error logging and throws JSON-encoded error messages for visibility.

## Developer orientation — important files to inspect
- server.ts — main server, AI prompt construction, /api/analyze endpoint and Vite middleware configuration.
- services/db.ts — all Firestore interactions (getTargets, getBugReports, getCodeAnalyses, saveX, deleteX). Good starting point for persistence changes.
- firebase.ts + firebase-applet-config.json — app initialization for Firestore.
- components/Analyzer.tsx — UI for uploading/pasting code to be analyzed and logic for converting findings to draft bug reports.
- App.tsx — top-level state management and wiring between components and services.
- types.ts — TypeScript interfaces for Target, BugReport, CodeAnalysis, Finding, etc. Use these for upstream/downstream changes.

## Typical workflows
- Developer pastes or uploads Python code into the Analyzer tab → frontend calls POST /api/analyze → server calls Gemini and returns structured vulnerabilities → developer reviews findings in the Analyzer and can convert a Finding into a draft BugReport → draft report is editable and saved to Firestore via services/db.ts.
- Targets can be registered and deleted; deleting a target triggers cleanup of associated bug reports and checklists (see deleteTarget in services/db.ts).

## Troubleshooting
- "GEMINI_API_KEY is not configured" — ensure GEMINI_API_KEY is present in your environment before starting the server.
- Firestore permission errors — check firebase-applet-config.json and firestore.rules; confirm Firestore is enabled for your Firebase project and the app is using the correct project ID and database.
- Server TypeScript errors on startup — run npx tsc to surface compilation errors or run with ts-node-dev to bypass build step during development.

## Contributing
- Fork and open a pull request with a clear description of change and any migration steps if you change the Firestore schema or API contract.
- If you add backend endpoints, update server.ts and document the request/response shapes in this README.
- If you change persisted document shapes, update types.ts and services/db.ts to match.

## License
Files in this repository include an Apache-2.0 SPDX header. If you are publishing or reusing code, refer to the LICENSE file (or add one) and comply with the Apache-2.0 license.

## Acknowledgements

This project was created with assistance from Google Studios, whose guidance and tooling helped with AI-driven analysis and design decisions. Special thanks to the Google Studios resources that streamlined integration with Gemini and the development workflow.

## Try asking
- How do I configure firebase-applet-config.json for my Firebase project (which fields does the app expect)?
- The Analyzer returns unexpected output from Gemini — where in server.ts is the system instruction constructed and how can I tune the response schema?
- I want to add an authentication layer and restrict Firestore access — which files should I update and which Firestore rules would you recommend for a developer-only workspace?

## Acknowledgements and credits
- Built with React, Vite, Express, Firebase, and Google Gemini (via @google/genai).
- UI components organized in components/, and Firestore access centralized in services/db.ts for easy audits and upgrades.
