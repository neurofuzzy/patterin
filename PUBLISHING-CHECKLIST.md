# Publishing Checklist for Patterin v0.2.0

## Pre-Publish Verification ✅

### Code Quality
- [x] All TypeScript errors fixed
- [x] All 194 tests passing
- [x] Build succeeds (`npm run build`)
- [x] Playground builds (`npm run build:playground`)
- [x] Examples work correctly

### Documentation
- [x] README humanized and updated
- [x] Complete API reference (API.md)
- [x] 28 working examples in examples/
- [x] Deployment guide (DEPLOYMENT.md)
- [x] Version updated to 0.2.0

### Package Configuration
- [x] `.npmignore` configured to exclude dev files
- [x] `files` in package.json includes: dist, README, API.md, examples, LICENSE
- [x] `prepublishOnly` script runs tests and build
- [x] Repository URLs configured
- [x] Homepage points to playground

## Publishing to npm

### Step 1: Final Checks

```bash
# Verify what will be published
npm publish --dry-run

# Check package size
npm pack
tar -tzf patterin-0.2.0.tgz | less

# Clean up
rm patterin-0.2.0.tgz
```

### Step 2: Login to npm

```bash
npm whoami  # Check if logged in
npm login   # If needed
```

### Step 3: Publish

```bash
# Publish to npm (prepublishOnly will run tests and build)
npm publish

# Or publish as beta first
npm publish --tag beta
```

### Step 4: Verify

```bash
# Check on npm
npm view patterin

# Test installation
mkdir /tmp/test-patterin && cd /tmp/test-patterin
npm init -y
npm install patterin
node -e "const { shape } = require('patterin'); console.log(shape.circle())"
```

## Deploying to GitHub Pages

### Step 1: Build Everything

```bash
# Build library and playground
npm run deploy
```

This creates:
- `dist/` - Compiled library
- `docs/playground/` - Built playground for GitHub Pages

### Step 2: Commit and Push

```bash
git status
git add dist/ docs/playground/
git commit -m "Release v0.2.0: Deploy library and playground"
git push origin main
```

### Step 3: Tag Release

```bash
git tag v0.2.0
git push origin v0.2.0
```

### Step 4: Configure GitHub Pages

1. Go to repository Settings > Pages
2. Source: Deploy from a branch
3. Branch: `main`
4. Folder: `/docs`
5. Save

### Step 5: Verify Deployment

After a few minutes, check:
- https://neurofuzzy.github.io/patterin/playground/

## Post-Publish Tasks

### npm
- [ ] Verify package appears on npmjs.com
- [ ] Test installation in clean environment
- [ ] Check that examples work when installed

### GitHub
- [ ] Verify playground loads correctly
- [ ] Check Monaco editor works
- [ ] Test example code in playground
- [ ] Verify all assets load (no 404s)

### Announcements
- [ ] Create GitHub release with changelog
- [ ] Post on social media (optional)
- [ ] Update project website (if applicable)

## Troubleshooting

### npm Publish Fails

**Authentication Error:**
```bash
npm logout
npm login
```

**Version Already Exists:**
- Bump version in package.json
- Try again

### GitHub Pages Issues

**404 on Playground:**
- Verify `base` in playground/vite.config.ts: `/patterin/playground/`
- Check docs/playground/ contains index.html
- Verify GitHub Pages points to /docs

**Assets Not Loading:**
- Check browser console for 404s
- Verify asset paths in built files
- Rebuild: `npm run build:playground`

## Files Included in npm Package

```
patterin-0.2.0.tgz
├── dist/                    # Compiled TypeScript
│   ├── index.js
│   ├── index.d.ts
│   ├── collectors/
│   ├── contexts/
│   ├── primitives/
│   ├── shapes/
│   └── systems/
├── examples/                # Example code (.ts files)
│   ├── 01-basics/
│   ├── 02-transformations/
│   ├── 03-contexts/
│   ├── 04-grids/
│   ├── 05-tessellations/
│   ├── 06-fractals/
│   ├── 07-advanced/
│   ├── README.md
│   ├── utils.ts
│   └── index.ts
├── README.md
├── API.md
├── LICENSE
└── package.json
```

## Files NOT Included (via .npmignore)

- Source files (src/)
- Tests (tests/)
- Build configs
- Playground
- Documentation specs
- Test output
- Examples output directory

---

**Ready to Publish!** ✅

All checks complete. Package is ready for npm and GitHub Pages deployment.
