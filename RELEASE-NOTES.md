# Release Notes - Patterin v0.2.0

## Overview

Patterin v0.2.0 is ready for npm publishing and GitHub Pages deployment with comprehensive documentation, 28 working examples, and a live playground.

## What's New in v0.2.0

### New Features
- **Quilt System** - Traditional quilt block patterns with grid-based placement
  - 7 quilt block templates (Pinwheel, Broken Dishes, Friendship Star, etc.)
  - Two-character shortcuts (PW, BD, FS, SF, BT, DP, SS)
  - Half-Square Triangles (HST) and Flying Geese primitives
  - Selection methods: `every()`, `slice()`, `at()`, `all()`
  - Shape groups ('light'/'dark') for fabric color assignment

### Documentation
- **Humanized README** - Welcoming intro with simple examples first
- **Complete API Reference** - 1000+ lines covering every method including quilting
- **30+ Runnable Examples** - Organized in 8 categories from beginner to advanced
- **Deployment Guide** - Step-by-step instructions for npm and GitHub Pages

### Examples Directory
- **01-basics/** - Circle, star, gear, multiple shapes (4 examples)
- **02-transformations/** - Cloning, offsets, scale/rotate (4 examples)
- **03-contexts/** - Point/line manipulation, polar spreads (4 examples)
- **04-grids/** - Square, hexagonal, triangular grids (4 examples)
- **05-tessellations/** - Truchet, Penrose, trihexagonal (3 examples)
- **06-fractals/** - Koch, dragon, Hilbert, Sierpiński, plant (6 examples)
- **10-quilting/** - Traditional quilt blocks and patterns (2 examples)
- **07-advanced/** - Complex mandalas, geometric patterns, plotter art (4 examples)

All examples now write output to `examples/output/` instead of stdout.

### Technical Improvements
- Fixed TypeScript build errors with immutable Vector2
- Fixed EdgeBasedSystem geometry transformations
- Configured playground for GitHub Pages deployment
- Added proper .npmignore for clean package

### Playground
- Monaco editor with full TypeScript support
- Auto-complete for entire Patterin API
- Instant visual preview with pan/zoom
- Builds to `docs/playground/` for GitHub Pages

## Package Contents

### Included Files
- `dist/` - Compiled TypeScript library
- `examples/` - 28 runnable example files
- `README.md` - Main documentation
- `API.md` - Complete API reference
- `LICENSE` - MIT license

### Excluded Files (Development Only)
- Source TypeScript (`src/`)
- Tests (`tests/`)
- Playground source
- Build configurations
- Design specifications

## Statistics

- **Package Version:** 0.2.0
- **Tests:** 194 passing
- **Examples:** 30+ files
- **API Documentation:** 1000+ lines
- **Quilt Blocks:** 7 traditional patterns
- **Line Count:** ~16,000 lines of source code

## Installation

Once published:

```bash
npm install patterin
```

## Usage

```typescript
import { shape, system, SVGCollector } from 'patterin';

// Create a simple star
const star = shape.circle()
  .radius(50)
  .numSegments(10);

star.points.every(2).expand(20);

// Output to SVG
const svg = new SVGCollector();
star.stamp(svg);
console.log(svg.toString());
```

## Links

- **npm:** https://npmjs.com/package/patterin (after publishing)
- **Playground:** https://neurofuzzy.github.io/patterin/playground/ (after deployment)
- **Repository:** https://github.com/neurofuzzy/patterin
- **Issues:** https://github.com/neurofuzzy/patterin/issues

## Next Steps

See [PUBLISHING-CHECKLIST.md](PUBLISHING-CHECKLIST.md) for complete publishing instructions.

### To Publish to npm:

```bash
npm publish
```

### To Deploy Playground:

```bash
npm run deploy
git add docs/playground/
git commit -m "Deploy playground to GitHub Pages"
git push origin main
```

Then configure GitHub Pages to serve from `/docs`.

## Changelog

### v0.2.0 (2026-01-19)

**Added:**
- **Quilting System** with traditional quilt block patterns
  - 7 block templates: Pinwheel, Broken Dishes, Friendship Star, Shoo Fly, Bow Tie, Dutchman's Puzzle, Sawtooth Star
  - Half-Square Triangle (HST) and Flying Geese primitives
  - Grid-based placement with selection: `every()`, `slice()`, `at()`, `all()`
  - Shape groups for fabric colors ('light'/'dark')
- Comprehensive API documentation (API.md) with quilting reference
- 30+ organized examples including quilting patterns
- Deployment guide and publishing checklist
- GitHub Pages configuration for playground

**Improved:**
- Humanized README with better learning progression and quilting examples
- Example files now write to examples/output/
- Better package configuration with .npmignore
- Fixed TypeScript compilation errors
- Playground examples updated with quilting patterns

**Fixed:**
- Vector2 immutability issues in EdgeBasedSystem
- Unused variable warnings in TessellationSystem
- Monaco editor type issues in playground
- Build configuration for GitHub Pages

---

**Status:** ✅ Ready for Publishing

All systems go! Package is fully tested, documented, and ready for npm and GitHub Pages.
