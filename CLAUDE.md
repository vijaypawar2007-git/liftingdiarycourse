# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL: Documentation-First Development

**ALWAYS refer to the `/docs` directory FIRST before generating any code.**

Before writing or modifying any code:
1. Check if relevant documentation exists in the `/docs` directory
2. Read and follow the patterns, examples, and guidelines provided in those docs
3. Ensure your code aligns with the documented standards and practices
4. If no relevant documentation exists, ask the user if documentation should be created

The `/docs` directory contains the source of truth for how features should be implemented in this project. Never assume implementation details without consulting the relevant documentation first.

## Project Overview

This is a lifting diary course application built with Next.js 16.1.1, React 19, TypeScript, and Tailwind CSS v4. The project uses the App Router architecture and is configured with React Compiler enabled for automatic optimization.

## Development Commands

- `npm run dev` - Start development server at http://localhost:3000 with hot reload
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint checks

## Architecture

**Framework Configuration:**
- Next.js with App Router (not Pages Router)
- React Compiler enabled in next.config.ts (automatic memoization)
- TypeScript with strict mode and path aliases (`@/*` maps to `./src/*`)
- Tailwind CSS v4 using the new `@import` and `@theme` syntax

**Project Structure:**
- `src/app/` - App Router pages and layouts
  - `layout.tsx` - Root layout with Geist font configuration
  - `page.tsx` - Homepage component
  - `globals.css` - Global styles with CSS variables for theming

**Styling System:**
- Tailwind CSS v4 with custom CSS variables
- Dark mode via `prefers-color-scheme` media query
- Geist Sans and Geist Mono fonts loaded via `next/font/google`
- Custom theme tokens: `--color-background`, `--color-foreground`, `--font-sans`, `--font-mono`

**Import Paths:**
- Use `@/` prefix for imports from `src/` directory (e.g., `import Component from '@/components/MyComponent'`)

## Authentication (Clerk)

This project uses Clerk for authentication with Next.js App Router integration.

**Setup:**
- Clerk SDK: `@clerk/nextjs`
- Middleware: `src/middleware.ts` uses `clerkMiddleware()` from `@clerk/nextjs/server`
- Provider: App wrapped with `<ClerkProvider>` in `src/app/layout.tsx`
- Environment variables: Set in `.env.local` (not tracked in git)
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`

**Important:**
- Always use `clerkMiddleware()` (not the deprecated `authMiddleware()`)
- Import auth utilities from `@clerk/nextjs/server` (server-side) or `@clerk/nextjs` (client components)
- Use async/await when calling auth methods like `auth()` from `@clerk/nextjs/server`
- Available components: `<SignInButton>`, `<SignUpButton>`, `<UserButton>`, `<SignedIn>`, `<SignedOut>`
