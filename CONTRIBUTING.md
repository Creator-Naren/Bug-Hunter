# Contributing to Bug Hunter

Thank you for helping improve Bug Hunter! This document explains how to get the project running locally, the preferred contribution workflow, and some important places to make changes when you modify the data model or API.

Getting started (development)

1. Fork the repository and clone your fork:

```bash
git clone git@github.com:<your-username>/Bug-Hunter.git
cd Bug-Hunter
```

2. Install dependencies:

```bash
npm install
```

3. Configure Firebase and Gemini:

- Copy the example Firebase config included in the repo:

```bash
cp firebase-applet-config.example.json firebase-applet-config.json
```

- Edit firebase-applet-config.json and replace the placeholder values with your Firebase project settings.
- Set your Google Gemini API key as an environment variable on the machine running the server:

```bash
export GEMINI_API_KEY="your_gemini_api_key"
```

4. Start the app for development:

- Run the backend server (this also mounts Vite in middleware mode by default):

```bash
npm run dev:server
```

- (Optional) Run the frontend dev server separately if you prefer hot reload using Vite directly:

```bash
npm run dev:frontend
```

- Quick alternative to run only the bundled dev server:

```bash
npm run dev
```

Build & production

- Build the frontend: `npm run build` (the repo already contains a `build` script).
- Compile the server to dist/ using the build step in package.json (see `build`).
- Start the compiled server: `npm start`

Code standards and review

- TypeScript: Keep types in sync. When changing a persisted shape (documents in Firestore), update `types.ts` and `services/db.ts` accordingly.
- Formatting: There is no mandated formatter in the repo. If you add one, include formatting rules and a pre-commit hook in a follow-up PR.
- Tests: Add tests under a `tests/` directory when appropriate and update package.json to include test scripts.

Pull request process

1. Create a feature branch from main: `git checkout -b feat/short-description`.
2. Make changes and keep commits small and focused.
3. Push to your fork and open a pull request against `Creator-Naren/Bug-Hunter:main`.
4. In the PR description, explain what you changed, why, and any migration steps (e.g., Firestore schema updates).

When to update other files

- Firestore schema changes: update `firestore.rules`, `types.ts`, and `services/db.ts` in the same PR and provide a short migration note in the PR.
- API contract changes (e.g. /api/analyze response shape): update `server.ts`, `types.ts`, and the README API section.

Security & secrets

- Do not commit secrets (API keys, service account JSON, etc.). Use environment variables for secrets and `firebase-applet-config.json` only for non-secret configuration values.
- If a credential accidentally gets committed, rotate it immediately and open a PR to remove the secret from the repo.

Thanks again for contributing — if you need help setting up Firestore or Gemini keys, open an issue or ping the repo owner.
