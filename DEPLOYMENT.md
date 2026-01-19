# Deployment Guide

This document describes how to publish Patterin to npm and deploy the playground to GitHub Pages.

## Prerequisites

- Node.js 18+ installed
- npm account with publishing rights
- GitHub repository access

## Publishing to npm

### 1. Pre-publish Checklist

- [ ] All tests passing: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Version updated in `package.json`
- [ ] CHANGELOG updated (if you create one)
- [ ] README reflects current features

### 2. Publish

The `prepublishOnly` script automatically runs tests and builds before publishing:

```bash
# Dry run to see what will be published
npm publish --dry-run

# Publish to npm
npm publish

# Or publish with a dist tag
npm publish --tag beta
```

### 3. Verify

Check the package on npm:
```bash
npm view patterin
```

Test installation in a fresh directory:
```bash
mkdir test-install && cd test-install
npm init -y
npm install patterin
```

## Deploying Playground to GitHub Pages

### 1. Build the Playground

```bash
# Build both the library and playground
npm run deploy
```

This will:
1. Build the TypeScript library to `dist/`
2. Build the playground to `docs/playground/`

### 2. Commit and Push

```bash
git add docs/playground
git commit -m "Deploy playground to GitHub Pages"
git push origin main
```

### 3. Configure GitHub Pages

Go to your repository settings on GitHub:
1. Navigate to **Settings > Pages**
2. Under **Source**, select:
   - Branch: `main`
   - Folder: `/docs`
3. Click **Save**

GitHub will deploy the playground to: `https://neurofuzzy.github.io/patterin/playground/`

### 4. Verify Deployment

After a few minutes, visit:
```
https://neurofuzzy.github.io/patterin/playground/
```

The playground should load with the Monaco editor and preview panel.

## Development Workflow

### For npm Package

1. Make changes to `src/`
2. Update tests in `tests/`
3. Run `npm test` to verify
4. Run `npm run build` to check TypeScript compilation
5. Bump version in `package.json`
6. Run `npm publish`

### For Playground

1. Make changes to `playground/src/`
2. Test locally: `cd playground && npm run dev`
3. Build: `npm run build:playground`
4. Commit `docs/playground/` changes
5. Push to trigger GitHub Pages deployment

## Versioning

Follow semantic versioning:
- **Major** (1.0.0): Breaking API changes
- **Minor** (0.1.0): New features, backward compatible
- **Patch** (0.0.1): Bug fixes, backward compatible

## Troubleshooting

### npm Publish Issues

**"You do not have permission to publish"**
- Verify you're logged in: `npm whoami`
- Login if needed: `npm login`
- Check package name isn't taken (if first publish)

**"Package name too similar to existing package"**
- Change package name in `package.json`
- Update imports in documentation

### GitHub Pages Issues

**404 on deployment**
- Check base path in `playground/vite.config.ts` matches repo structure
- Verify `docs/playground/` contains `index.html`
- Check GitHub Pages settings point to `/docs`

**Assets not loading**
- Verify `base` in vite config: `/patterin/playground/`
- Check console for 404 errors on asset paths
- Rebuild with `npm run build:playground`

**Monaco editor not working**
- Check `optimizeDeps` in vite config includes all workers
- Verify worker files are in build output
- Check browser console for errors

## Files Published to npm

See `.npmignore` for excluded files. Published files include:
- `dist/` - Compiled TypeScript
- `examples/` - Example code (`.ts` files)
- `README.md` - Main documentation
- `API.md` - API reference
- `LICENSE` - MIT license

## Files Deployed to GitHub Pages

Located in `docs/playground/`:
- `index.html` - Main playground page
- `assets/` - Bundled JavaScript and CSS
- Monaco editor workers

---

**Last Updated:** January 19, 2026
