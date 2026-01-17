# Patterin Tech Stack

## Core Library (Phase 1)
- **Language**: TypeScript 5.7+ (strict mode, ESM)
- **Build**: `tsc` for library output
- **Testing**: Vitest
- **Output**: ESM modules to `dist/`

## UI/Playground (Phase 2)
- **Framework**: None (vanilla JS/TS)
- **Bundler**: Vite 6
- **Editor**: CodeMirror 6
  - `@codemirror/view`
  - `@codemirror/lang-javascript`
  - `@codemirror/autocomplete`
- **State**: Vanilla JS or `@preact/signals-core` if needed
- **Rendering**: Direct SVG DOM manipulation
- **Storage**: localStorage

## Development
- **Package manager**: npm
- **Node**: 18+
- **Dev server**: Vite dev server
- **Hot reload**: Vite HMR

## Distribution
- **Library**: Published to npm as ESM package
- **Playground**: Static site (GitHub Pages or similar)
- **Bundle target**: ES2020, modern browsers only