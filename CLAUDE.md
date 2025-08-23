# Claude Context for ChordTrainer Project

This document provides Claude with essential context and guidelines for working with the ChordTrainer project effectively.

## Project Overview

ChordTrainer is a sophisticated web-based music education application focused on chord recognition and ear training. It's designed to help musicians develop their musical skills through interactive exercises and games.

**Core Purpose**: Music education through interactive chord and scale degree training
**Target Users**: Musicians, music students, and anyone looking to improve their ear training skills

## Technical Stack

- **Framework**: React 18 with Vite (fast development and building)
- **Languages**: TypeScript (preferred for new code) and JavaScript
- **Styling**: Tailwind CSS (utility-first approach)
- **State Management**: Zustand (lightweight state management)
- **Routing**: React Router DOM
- **Audio Engine**: 
  - `tone` library for audio synthesis and playback
  - `tonal` library for music theory calculations
  - Comprehensive sample library in `public/samples/`
- **Internationalization**: i18next with JSON translation files
- **Build Tool**: Vite with path aliases configured
- **Code Quality**: ESLint for linting

## Project Architecture

### Directory Structure
```
src/
├── components/          # Global, reusable components
├── pages/              # Route-based page components
│   ├── Intro.jsx       # Landing page
│   ├── ChordTrainer/   # Main chord training feature
│   └── EarTrainers/    # Various ear training modules
├── stores/             # Zustand global state stores
├── styles/             # Global CSS files
└── utils/              # Shared utility functions
    ├── common/         # General helpers
    ├── Tone/          # Audio/music utilities
    └── ChordTrainer/  # Feature-specific utilities

public/
├── locales/           # i18n translation files
└── samples/          # Instrument audio samples
```

### Key Features
1. **Chord Color Trainer**: Visual and audio chord recognition
2. **Degree Trainer**: Scale degree identification exercises
3. **Piano Drills**: Interactive piano-based exercises with clickable keys
4. **Multiple Instruments**: Various instrument samples for realistic sound
5. **Responsive Design**: Works across different screen sizes
6. **Multilingual Support**: English and Chinese translations

## Development Guidelines

### Code Organization
- **Global Components**: Reusable across features → `src/components/`
- **Feature Components**: Specific to one trainer → within feature directory
- **State Management**: 
  - Global state (volume, instrument selection) → `src/stores/`
  - Local state → React hooks or feature-specific stores

### Coding Standards
- **Prioritize TypeScript** for new components and utilities
- **Use Tailwind CSS** utility classes for styling
- **Leverage path aliases** for clean imports (@components, @utils, @stores, @pages)
- **Follow React best practices**: functional components, hooks, proper prop types
- **Run `npm run lint`** before committing changes

### Audio Implementation Notes
- Audio is central to the application - handle with care
- Use existing Tone utilities in `src/utils/Tone/`
- Instrument samples are pre-loaded and managed through samplers
- Volume and sound settings are globally managed

### Adding New Features
1. Create feature directory in appropriate location
2. Include `index.jsx/tsx` as entry point
3. Co-locate components, hooks, and utilities within feature
4. Add routes in `src/pages/WebRoutes.jsx`
5. Add translations to `public/locales/` if needed

### Common Patterns
- **Settings Management**: Use Zustand stores for persistent settings
- **Audio Playback**: Leverage existing Tone utilities and samplers
- **Responsive Design**: Tailwind responsive prefixes (sm:, md:, lg:)
- **State Updates**: Zustand actions for global state, useState for local

## Important Considerations

### Performance
- Audio samples are large - manage loading efficiently
- Use React.memo and useMemo for expensive calculations
- Lazy load components where appropriate

### User Experience
- Immediate audio feedback is crucial for music training
- Visual feedback should complement audio cues
- Keyboard shortcuts enhance workflow for musicians

### Accessibility
- Ensure keyboard navigation works well
- Audio cues are essential - don't rely solely on visual feedback
- Consider different learning styles and abilities

## Development Workflow
1. **Understanding**: Review existing code patterns before implementing
2. **Planning**: Use TodoWrite tool for complex multi-step tasks
3. **Implementation**: Follow established patterns and conventions
4. **Testing**: Verify audio functionality and responsive behavior
5. **Linting**: Run `npm run lint` to ensure code quality
6. **Documentation**: Update relevant docs if adding significant features

## Key Files to Reference
- `GEMINI.md`: Original project instructions
- `vite.config.js`: Path aliases and build configuration
- `src/utils/Tone/`: Audio implementation patterns
- `src/stores/`: Global state management examples
- `public/locales/`: Translation structure

Remember: This is a music education tool where audio functionality and user experience are paramount. Always test audio features and consider the musician's workflow when making changes.