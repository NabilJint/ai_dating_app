<!-- prettier-ignore -->
# AI Dating — Mobile (Expo + React Native)

![Project Banner](assets/images/placeholder-banner.png)

> A modern, privacy-first mobile dating app built with Expo, React Native, and Convex — designed for delightful interactions, fast iteration, and production-ready experiences.

---

## Table of Contents

- [Project Title](#project-title)
- [Description](#description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Quick Start (Usage)](#quick-start-usage)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Project Title

AI Dating — Mobile

A small, production-minded dating application template focusing on: beautiful UI, low-latency realtime features (Convex), passwordless auth, secure photo uploads, and AI-assisted utilities.

## Description

This repository is a cross-platform mobile application built with Expo and React Native. It demonstrates a modern mobile architecture with:

- Component-driven UI and design system.
- A serverless-ish backend with Convex for realtime queries/mutations.
- Clerk (or similar) for authentication (email/passwordless flows).
- Photo storage and upload utilities.
- Modular hooks and presentational components for maintainability.

The codebase is intentionally structured for clarity and rapid iteration — great for portfolio demos, prototypes, or as a starting point for a production app.

## Features

- Clean, composable React Native UI built with Expo.
- Profile editing with multi-photo uploads and image picker.
- Preferences, interests, and date-of-birth handling with validation.
- Location-aware features (reverse geocoding, opt-in location updates).
- Realtime data access via Convex (queries & mutations).
- Small, reusable hooks (for profile editing, photo picking, etc.).
- Theming, adaptive glass effects, and accessibility considerations.
- Configurable AI utilities (OpenAI integration available in `lib/openai.ts`).

## Tech Stack

- Runtime: Expo (React Native)
- Language: TypeScript
- State & Data: Convex (realtime), local hooks
- Auth: Clerk (or pluggable auth provider)
- Storage: platform file storage (wrapped by `usePhotoPicker`)
- UI: React Native + custom components
- Utilities: date-fns, expo-linear-gradient, vector-icons

## Installation

Prerequisites

- Node.js (LTS)
- pnpm (recommended) or npm/yarn
- Expo CLI (optional for native builds)

Clone and install dependencies:

```bash
git clone <your-repo-url>
cd ai-dating-app
pnpm install
```

Environment variables

- Copy `.env.example` (if present) or create a local `.env` with values for:
  - CLERK_FRONTEND_API (or other Clerk config)
  - CONVEX_ROOT_URL / Convex keys
  - OPENAI_API_KEY (optional — used by AI utilities)

If you integrate external services (Clerk, Convex, OpenAI), ensure credentials are created and available in your environment or local secrets manager.

## Quick Start (Usage)

Run type-check (recommended):

```bash
pnpm -w tsc --noEmit
```

Start the development server (Expo):

```bash
pnpm expo start
```

Open the app on your device or simulator using the Expo Dev Tools.

Notes

- If you run into missing environment variables, the app will usually log an explicit error; supply the corresponding values and restart the server.
- For Convex and Clerk integration, follow the providers' docs to create an app and add the client keys.

## Screenshots

> Replace these with high-fidelity screenshots or a short demo GIF for portfolio presentation.

![Home Screen](assets/images/screenshot-home.png)
![Profile Edit](assets/images/screenshot-edit-profile.png)

Tip: To create a demo GIF, use QuickTime + Gifbrewery or a terminal tool like `gifshot` or `ffmpeg`.

## Project Structure (high level)

```
app/                      # Expo / router screens
components/               # Reusable UI components
hooks/                    # Custom hooks (e.g. useEditProfile)
lib/                      # Utilities (openai, photos, theme, location)
convex/                   # Convex functions and generated types
assets/                   # Images and media used by the app
README.md
package.json
```

The `app/(app)/edit-profile.tsx` screen is intentionally thin — logic is implemented in `hooks/useEditProfile.ts` and UI split into small presentational components for clarity and maintainability.

## Contributing Guidelines

Thank you for considering contributing! A few simple guidelines to keep the project healthy:

1. Fork the repo and create a feature branch (feature/..., fix/..., chore/...).
2. Keep changes small and focused; a PR should be easy to review.
3. Run linters and TypeScript before opening a PR: `pnpm -w tsc --noEmit`.
4. Add or update unit tests for new logic where applicable.
5. Maintain a clean git history (rebase or squash as needed).

Code style

- This project uses TypeScript and follows a compact, readable style. Feel free to add Prettier/ESLint config if you plan on contributing regularly.

Reporting bugs & feature requests

- Open an issue with a clear title, short reproduction steps, and expected behavior. Attach screenshots or logs when helpful.

## License

This project is provided under the MIT License — feel free to use it in your portfolio or as the basis for your app. Replace the license with your preferred choice if needed.

MIT © [Your Name]

## Contact

Want to collaborate or see a portfolio? Reach out:

- Email: you@example.com
- LinkedIn: https://www.linkedin.com/in/your-profile
- Twitter: https://twitter.com/your-handle

If you'd like me to customize this README with real screenshots, a live demo link, or change the license/contact info, tell me what to include and I'll update it.

---

Made with care — ship delightful experiences.

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
# ai_dating_app
