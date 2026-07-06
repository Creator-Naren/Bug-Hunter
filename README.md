# 🐛 Bug Hunter

> A **local-first developer tool** for AI-powered Python security analysis, vulnerability detection, and report management.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

---

## 🎯 Overview

Bug Hunter combines **AI-powered static analysis** with a **modern web UI** to help developers identify, track, and manage security vulnerabilities in Python code. Built with TypeScript, React, Firebase, and Google Gemini, it provides a seamless workflow from code scanning to vulnerability reporting.

### Key Features

- 🔍 **Structured AI Security Analysis** — Scan Python code with Gemini for comprehensive vulnerability detection
- 📋 **Vulnerability Reporting** — Convert AI findings into actionable draft bug reports
- 📊 **Project Management** — Track targets (projects/repositories) and organize security findings
- 💾 **Persistent Storage** — Store analyses and reports in Firebase Firestore
- 📈 **Developer Dashboard** — View analytics, quick actions, and system logs
- 🎨 **Clean Web UI** — Intuitive React interface with a sidebar-based navigation model

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React (TSX), Vite, Tailwind-inspired utilities |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | Firebase Firestore |
| **AI Engine** | Google Gemini API (@google/genai) |
| **Languages** | TypeScript (97.2%), HTML (1.6%), CSS (1.2%) |

---

## 📁 Project Structure

```
Bug-Hunter/
├── src/
│   ├── App.tsx                      # Main React application component
│   ├── index.tsx                    # React entry point
│   ├── index.html                   # SPA HTML shell
│   ├── index.css                    # Global styles
│   ├── types.ts                     # TypeScript interfaces & DTOs
│   │
│   ├── components/
│   │   ├── Dashboard.tsx            # Overview & quick actions
│   │   ├── Analyzer.tsx             # Code analysis UI & findings converter
│   │   ├── BugReports.tsx           # Vulnerability reports list & editor
│   │   ├── Targets.tsx              # Project/repository management
│   │   └── Sidebar.tsx              # Navigation & system logs
│   │
│   ├── services/
│   │   └── db.ts                    # Firestore CRUD operations
│   │
│   ├── firebase.ts                  # Firebase initialization
│   ├── server.ts                    # Express server & /api/analyze endpoint
│   │
│   ├── config/
│   │   ├── firebase.json            # Firebase deployment config
│   │   ├── firebase-applet-config.json   # Firebase app credentials
│   │   └── firestore.rules          # Firestore security rules
│   │
│   ├── metadata.json                # App metadata & branding
│   ├── tsconfig.json                # TypeScript configuration
│   └── vite.config.ts               # Vite configuration
│
├── package.json                     # Dependencies & scripts
├── package-lock.json                # Dependency lock file
└── README.md                        # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (14+ or current LTS recommended)
- **Firebase Project** with Firestore enabled
- **Google Gemini API Key** (`GEMINI_API_KEY` environment variable)
- **firebase-applet-config.json** in the repository root with your Firebase app config

### Installation

```bash
# Clone and navigate
git clone https://github.com/Creator-Naren/Bug-Hunter.git
cd Bug-Hunter

# Install dependencies
npm install
```

### Development

```bash
# Start the development server (with hot reload)
npm run dev

# or manually with ts-node-dev
npx ts-node-dev --respawn --transpile-only server.ts
```

The app will be available at `http://localhost:3000`

### Production Build

```bash
# Build the frontend
npm run build

# Compile backend TypeScript
npx tsc

# Run the production server
NODE_ENV=production node dist/server.js
```

---

## 🔌 API Reference

### `/api/analyze` — Analyze Python Code

**Endpoint:** `POST /api/analyze`

**Request:**
```json
{
  "code": "<python source code as string>"
}
```

**Response:**
```json
{
  "vulnerabilities": [
    {
      "type": "SQL Injection",
      "severity": "Critical | High | Medium | Low | Info",
      "lineNumber": 42,
      "description": "Detailed explanation of the vulnerability",
      "recommendation": "Suggested fix or mitigation"
    }
  ],
  "overallSeverity": "Critical | High | Medium | Low | None",
  "summary": "High-level analysis summary"
}
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini API key for AI analysis |
| `NODE_ENV` | ❌ No | Set to `production` for production builds (default: `development`) |

### Firebase Configuration (`firebase-applet-config.json`)

Create or update this file with your Firebase project credentials:

```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project",
  "storageBucket": "your-project.appspot.com",
  "messagingSenderId": "YOUR_SENDER_ID",
  "appId": "YOUR_APP_ID"
}
```

### Firestore Collections

The app expects the following Firestore collections:

- **targets** — Project/repository metadata
- **bug_reports** — Vulnerability reports
- **checklists** — Security methodologies (optional)
- **code_analyses** — Historical analysis records

All documents should include `createdAt` and `updatedAt` timestamps.

---

## 📚 How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                      Developer Workflow                      │
└─────────────────────────────────────────────────────────────┘

1. Developer pastes/uploads Python code in Analyzer tab
                        ↓
2. Frontend sends code to POST /api/analyze
                        ↓
3. Server constructs structured prompt → calls Gemini API
                        ↓
4. Gemini returns JSON-formatted security findings
                        ↓
5. Frontend parses findings → displays vulnerabilities
                        ↓
6. Developer reviews → converts to draft bug report
                        ↓
7. Report saved to Firestore → tracked in BugReports tab
```

---

## 🔒 Security Considerations

### Credentials & Secrets

⚠️ **Never commit sensitive information to the repository!**

- `GEMINI_API_KEY` — store only in environment variables
- `firebase-applet-config.json` — keep credentials secure
- Add these files to `.gitignore` if using actual credentials

### Firestore Rules

Update `firestore.rules` to match your authentication model:

```javascript
// Example: Authenticated users only
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🛠️ Key Files for Development

| File | Purpose |
|------|---------|
| **server.ts** | Express server, AI prompt construction, `/api/analyze` endpoint |
| **services/db.ts** | All Firestore CRUD operations (getTargets, saveReport, deleteTarget, etc.) |
| **components/Analyzer.tsx** | Code upload/paste UI and findings-to-report conversion logic |
| **types.ts** | TypeScript interfaces (Target, BugReport, Finding, CodeAnalysis, etc.) |
| **App.tsx** | Top-level state management and component wiring |

---

## 🐛 Troubleshooting

### Issue: "GEMINI_API_KEY is not configured"

**Solution:** Ensure `GEMINI_API_KEY` is set in your environment:

```bash
export GEMINI_API_KEY="your-api-key"
npm run dev
```

### Issue: Firestore permission errors

**Solution:** 

1. Verify `firebase-applet-config.json` contains correct credentials
2. Confirm Firestore is enabled in your Firebase project
3. Check `firestore.rules` matches your auth model
4. Ensure your Firebase project has the required collections

### Issue: Server TypeScript errors on startup

**Solution:** Compile TypeScript to surface errors:

```bash
npx tsc
# or use ts-node-dev for instant feedback
npx ts-node-dev --respawn --transpile-only server.ts
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. **Create a feature branch** (`git checkout -b feature/your-feature`)
3. **Make your changes** and test thoroughly
4. **Update documentation** if you change the API or data model
5. **Submit a pull request** with a clear description

### Before Submitting

- Update `types.ts` if you modify data models
- Update `services/db.ts` if you change Firestore interactions
- Update `server.ts` if you add new endpoints
- Include migration steps in your PR if schema changes apply

---

## 📄 License

This project is licensed under the **Apache License 2.0**. See [LICENSE](LICENSE) file for details.

All source files include the Apache-2.0 SPDX header. If you reuse or publish code from this repository, please comply with the license terms.

---

## 🙏 Acknowledgements

Built with help and guidance from **Google Studios**, leveraging cutting-edge AI analysis tools and design best practices.

**Core Technologies:**
- [React](https://react.dev/) — UI framework
- [Vite](https://vitejs.dev/) — Frontend build tool
- [Express](https://expressjs.com/) — Backend framework
- [Firebase](https://firebase.google.com/) — Backend-as-a-Service
- [Google Gemini](https://ai.google.dev/) — AI-powered analysis

---

## 📞 Getting Help

**Have questions?** Check the [Discussions](https://github.com/Creator-Naren/Bug-Hunter/discussions) tab or review:

- How do I configure `firebase-applet-config.json` for my Firebase project?
- Where is the Gemini system instruction constructed in `server.ts`?
- How can I add authentication and restrict Firestore access?
- How do I customize the vulnerability detection schema?

---

<div align="center">

**Made with ❤️ for better code security**

[GitHub](https://github.com/Creator-Naren/Bug-Hunter) • [Issues](https://github.com/Creator-Naren/Bug-Hunter/issues) • [Discussions](https://github.com/Creator-Naren/Bug-Hunter/discussions)

</div>
