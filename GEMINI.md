# Gemini Project Instructions for ChordTrainer

This document provides guidelines for AI assistants to effectively contribute to the ChordTrainer project.

## 1. Project Overview

ChordTrainer is a web-based application designed for music education, specifically for practicing chords and training the ear. It is built with React and Vite, utilizing TypeScript and JavaScript. The application features interactive trainers for chord recognition, scale degrees, and more. Audio playback is a core feature, powered by the `tone` and `tonal` libraries with a rich library of instrument samples.

## 2. Core Technologies & Libraries

- **Framework**: React (with Vite)
- **Languages**: TypeScript and JavaScript. **Prioritize TypeScript for new code.**
- **Styling**: Tailwind CSS is the primary styling framework. Global styles are in `src/styles`.
- **State Management**: Zustand is used for global application state.
- **Routing**: `react-router-dom` handles navigation. Main routes are defined in `src/pages/WebRoutes.jsx`.
- **Audio Engine**: `tone` and `tonal` are used for all music theory logic and sound generation.
- **Internationalization (i18n)**: `i18next` handles translations. Text strings are stored in JSON files under `public/locales/`.
- **Linting**: ESLint is used for code quality. Run `npm run lint` to check for issues.

## 3. Project Structure

- **`public/`**: Contains static assets that are not processed by Vite.
  - **`public/locales/`**: Translation files for i18n (e.g., `en/common.json`).
  - **`public/samples/`**: A comprehensive library of instrument sound samples (piano, guitar, etc.).
- **`src/`**: Main application source code.
  - **`src/assets/`**: Static assets like images and fonts that are processed by Vite.
  - **`src/components/`**: Global, reusable React components (e.g., `Button.tsx`, `PianoVisualizer.tsx`). These should be generic and application-agnostic.
  - **`src/pages/`**: Top-level page components that correspond to application routes.
    - **`src/pages/Intro.jsx`**: The landing page.
    - **`src/pages/ChordTrainer/`**: The main "Chord Trainer" feature, with its own sub-pages, components, and logic.
    - **`src/pages/EarTrainers/`**: Contains various ear training modules like `ChordColorTrainer` and `DegreeTrainer`. These are complex features and often have their own specific components and state management hooks.
  - **`src/stores/`**: Global Zustand store definitions (e.g., `soundSettingsStore.ts`).
  - **`src/styles/`**: Global CSS files.
  - **`src/utils/`**: Utility functions shared across the application.
    - **`src/utils/common/`**: General-purpose helper functions.
    - **`src/utils/Tone/`**: Crucial modules for interacting with the `tone` library, managing samplers, and handling audio playback.
    - **`src/utils/ChordTrainer/`**: Utilities specific to the Chord Trainer feature.

## 4. Development Workflow & Conventions

- **Creating New Components**:
  - **Global Components**: If a component is reusable across different trainers (e.g., a custom slider, a modal), place it in `src/components/`.
  - **Feature-Specific Components**: If a component is only used within a specific trainer (e.g., the settings panel for the Diatonic Game), place it in the `components/` sub-directory for that feature (e.g., `src/pages/ChordTrainer/pages/DiatonicGame/components/`).
- **Adding New Features**:
  - A new trainer or major feature should be a new sub-directory within `src/pages/`.
  - It should contain its own `index.jsx` or `index.tsx` as the entry point.
  - All related components, hooks, and utilities should be co-located within that feature's directory.
- **State Management**:
  - For state that needs to be shared across different trainers (e.g., master volume, selected instrument), use a global store in `src/stores/`.
  - For state that is local to a single trainer or component, use React's built-in `useState`, `useReducer`, or a feature-specific Zustand store.
- **Styling**:
  - Use Tailwind CSS utility classes directly in your components.
  - Avoid writing custom CSS in `.css` files unless absolutely necessary for complex animations or overriding third-party library styles.
- **Committing Code**:
  - Before committing, ensure the code is free of linting errors by running `npm run lint`.
  - Write clear and descriptive commit messages.
- **Development Server**:
  - After making changes to the code, you do not need to run `npm run dev`. I have a process set up to run the development server automatically. Please wait for my feedback after you have completed the code modifications.

## 5. Path Aliases

The project uses Vite path aliases for cleaner imports. Refer to `vite.config.js` for the full list. Key aliases include:

- `@components`: `src/components`
- `@utils`: `src/utils`
- `@stores`: `src/stores`
- `@pages`: `src/pages`
- `@styles`: `src/styles`