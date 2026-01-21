# Example Thumbnails

This directory contains SVG thumbnail files for the example gallery.

## Generating Thumbnails

1. Start the dev server: `npm run dev` (from playground directory)
2. Visit: http://localhost:5173/generate-thumbnails.html
3. Click "Generate All Thumbnails"
4. Click "💾 Download All SVGs" to download all thumbnail files
5. Save the downloaded SVG files to this directory
6. Click "📋 Copy Code" and update `EXAMPLE_THUMBNAILS` in `src/examples/index.ts`

## File Naming

Thumbnails are named using slugified example names:
- "Circle" → `circle.svg`
- "Koch Curve" → `koch-curve.svg`
- "Vivid vs Muted" → `vivid-vs-muted.svg`

## Why Static Assets?

Storing thumbnails as separate SVG files instead of embedded strings:
- ✅ Smaller JavaScript bundle size
- ✅ Better browser caching
- ✅ Cleaner git diffs
- ✅ Easier to update independently
