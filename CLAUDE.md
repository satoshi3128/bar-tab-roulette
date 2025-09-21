# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**"You Pay Game"** - A roulette-style web application to decide who pays the bill. Users input participant names, and a swipe-to-spin roulette wheel randomly selects the "winner" who pays.

## Technology Stack

- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion (for swipe gestures and realistic spinning animations)
- **Design**: Mobile-first, responsive design

## Development Setup

### Initial Project Creation
```bash
# Create Next.js project (select TypeScript, Tailwind CSS, ESLint)
npx create-next-app@latest spin-the-opener

# Install animation library
npm install framer-motion
```

### Common Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Architecture Overview

### Core Component Structure
- `app/page.tsx` - Main page with state management for participants and winner
- `components/Roulette.tsx` - Core roulette wheel with spinning logic
- `components/NameForm.tsx` - Form for adding/removing participants
- `components/ResultModal.tsx` - Modal displaying the selected winner

### Key Technical Concepts

**Roulette Rendering**: Uses CSS `conic-gradient` to dynamically generate colored segments based on participant weights.

**Animation System**: Framer Motion's `useAnimate` hook manages:
- Swipe gesture detection (`onPanEnd`)
- Realistic deceleration animation with random rotation amounts
- Velocity-based power calculation for natural feel

**Winner Calculation**: Mathematical angle calculation determines winner based on:
- Final rotation angle modulo 360
- Participant weight distribution across the wheel
- Pointer position (accounts for upward-pointing arrow)

### Data Model
```typescript
interface Participant {
  name: string;
  weight: number; // For unequal probability distribution
}
```

## Advanced Features (Future)

- **Spin Strength Control**: User-adjustable power multiplier
- **Custom Weights**: Adjustable probability per participant
- **Surface Effects**: Different friction/momentum profiles (smooth, rough, obstacles)

## Important Notes

- Repository not yet initialized as git repository
- Project follows mobile-first responsive design principles
- Animation performance optimized for both mobile and desktop