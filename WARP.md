# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Development
```bash
# Start development server with Turbopack (faster builds)
npm run dev

# Alternative development commands
yarn dev
pnpm dev
bun dev
```

### Building & Production
```bash
# Build for production (uses Turbopack)
npm run build

# Start production server
npm start
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Install dependencies
npm install
```

### Development Server
- Development server runs on http://localhost:3000
- Hot reload is enabled by default
- Edit `src/app/page.tsx` to see changes instantly

## Architecture & Structure

### Tech Stack
- **Framework**: Next.js 15.5.2 with App Router
- **React**: Version 19.1.0
- **Build Tool**: Turbopack (Next.js's fast bundler)
- **Styling**: Tailwind CSS v4 with PostCSS
- **TypeScript**: Full TypeScript setup with strict mode
- **Fonts**: Geist font family (sans and mono variants)
- **Linting**: ESLint with Next.js and TypeScript presets

### Project Structure
```
src/
  app/
    layout.tsx      # Root layout with font configuration
    page.tsx        # Main homepage
    globals.css     # Global styles with Tailwind and custom CSS variables
public/             # Static assets (SVG icons)
```

### Key Patterns
- **App Router**: Uses Next.js 13+ App Router architecture
- **Font Optimization**: Automatic font optimization with `next/font/google`
- **CSS Variables**: Custom CSS properties for theming with dark mode support
- **TypeScript Paths**: Uses `@/*` path mapping for clean imports
- **Image Optimization**: Uses Next.js `Image` component for optimal loading

### Configuration Details
- **Turbopack**: Enabled for both dev and build for faster compilation
- **TypeScript**: Target ES2017 with modern module resolution
- **Tailwind**: Version 4 with PostCSS integration
- **ESLint**: Configured with Next.js Core Web Vitals and TypeScript rules
- **Dark Mode**: Automatic dark mode support via CSS `prefers-color-scheme`

### Styling System
- Primary fonts: Geist Sans and Geist Mono with CSS variable bindings
- Color scheme: Light (#ffffff/#171717) and dark (#0a0a0a/#ededed) mode support
- Tailwind utility classes with custom theme integration
- Responsive design with `sm:` breakpoint usage throughout components
