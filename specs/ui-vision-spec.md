# Patterin UI Vision & Theme Specification

## Core Philosophy

The UI is a **zen sketchbook for exploring pattern space**. Code and geometry are unified - the SVG rendering is an extension of syntax highlighting. Dark mode is the foundation, not an option.

## Layout

```
┌─────────────────────┬──────────────────────────────┐
│                     │                          ≡   │  <- hamburger only UI
│   Code Editor       │      Live Preview            │
│   (40% width)       │      (60% width)             │
│                     │                              │
│   • Calm spacing    │   • SVG canvas               │
│   • Subtle hints    │   • Auto-updates on edit     │
│   • Inline errors   │   • Pan/zoom                 │
│   • Click to edit   │   • Grid overlay (toggle)    │
│   • No clutter      │   • Center mark              │
│                     │                              │
└─────────────────────┴──────────────────────────────┘
```

**Single hamburger menu (≡) top-right** contains:
- Export SVG
- Theme selector
- Examples
- Settings

Everything else is hidden. **Minimal interface, progressive enhancement.**

## Editor Characteristics

### Interaction Model
- **Observable-style editing**: Code examples are static until clicked
- Click any line → becomes editable inline
- Blur or Escape → back to static display
- No "file" concept - it's a sketchbook, not a project
- Auto-save to localStorage (with manual clear option)

### Visual Design
- **Generous line-height**: 1.7 - 1.8 (breathing room)
- **No line numbers by default**: Show on hover or in gutter
- **Minimal chrome**: No toolbar clutter
- **Monospace font**: JetBrains Mono or similar with ligatures
- **Syntax highlighting**: Subtle, not garish rainbow
- **Inline autocomplete**: GitHub Copilot style, not dropdown

### Code Intelligence
- Autocomplete appears inline (ghost text)
- Method suggestions based on context type
- Hover shows brief documentation
- Errors appear inline, not in separate panel
- Type ahead for shape methods

### Starting State
Never blank - always loads with a simple example:
```javascript
const s = circle.radius(50).segments(8);
s.stamp(svg, 0, 0);
```

## Preview Pane

### Canvas Behavior
- **Updates live** as you type (250ms debounce)
- **Fit to view** by default - always shows full content
- **Pan**: Click + drag (or spacebar + drag)
- **Zoom**: Scroll wheel or pinch
- **Reset view**: Double-click background

### Overlays & Helpers
- **Grid overlay**: Toggle on/off, respects theme
- **Construction geometry**: Toggle ephemeral shapes visibility
- **Center mark**: Subtle crosshair at origin

### Inspection (Future)
- Click shape → highlights corresponding code
- Shows: vertex count, winding, bounds
- Ephemeral shapes labeled as such

## Hamburger Menu

**Location**: Top-right corner, single `≡` icon

**Menu items** (click opens modal):
```
≡
├─ Export SVG...
├─ Theme...
├─ Examples...
└─ Settings...
```

Each opens a **centered modal overlay**, dismissible by clicking outside or Escape.

### Export SVG Modal
```
┌──────────────────────────────┐
│   Export SVG                 │
├──────────────────────────────┤
│ Style:                       │
│ ○ Themed (current)           │
│ ○ Plain (black/white)        │
│                              │
│ Page Size:                   │
│ Width:  [8.5] ○ in ○ mm      │
│ Height: [11 ] ○ in ○ mm      │
│                              │
│ Preset: [Letter ▼]           │
│   • Letter (8.5×11 in)       │
│   • A4 (210×297 mm)          │
│   • A3 (297×420 mm)          │
│   • Custom                   │
│                              │
│ [Download SVG]               │
└──────────────────────────────┘
```

Preset selector auto-fills width/height. Custom allows manual entry.

### Theme Modal
```
┌──────────────────────┐
│   Choose Theme       │
├──────────────────────┤
│ ● GitHub Dark    ✓   │
│ ● Nord              │
│ ● Tokyo Night Storm  │
└──────────────────────┘
```
Click theme → applies immediately → modal stays open so you can compare

### Examples Modal
```
┌─────────────────────────────┐
│   Examples                   │
├─────────────────────────────┤
│ ┌────┬────┬────┬────┐       │
│ │Star│Gear│Grid│Web │       │
│ │[↻] │[↻] │[↻] │[↻] │       │
│ └────┴────┴────┴────┘       │
│                              │
│ Basics | Grids | Systems     │  <- category tabs
└─────────────────────────────┘
```
Click example → loads code → modal closes

### Settings Modal
```
┌──────────────────────┐
│   Settings           │
├──────────────────────┤
│ ☑ Auto-update preview│
│ ☑ Show grid          │
│ ☑ Show construction  │
│   geometry           │
│                      │
│ [Clear saved work]   │
└──────────────────────┘
```

Checkboxes toggle immediately, no "Apply" button needed.

## Theme System

### Philosophy
**Code and geometry share the same visual language.** When you type `circle`, the keyword color matches the stroke color of circles in the preview. The SVG is syntax-highlighted geometry.

### Theme Structure

```typescript
interface Theme {
  name: string;
  
  // Editor colors
  editor: {
    background: string;
    text: string;
    comment: string;
    keyword: string;      // shape, circle, rect, etc
    method: string;       // radius, segments, points
    number: string;
    string: string;
    operator: string;
    selection: string;
    cursor: string;
  };
  
  // SVG rendering colors (the key innovation)
  svg: {
    background: string;     // canvas background
    stroke: string;         // default shape stroke
    strokeWidth: number;    // default width
    ephemeral: string;      // construction geometry
    grid: string;           // overlay grid
    accent: string;         // highlights, selections
  };
  
  // System-specific overrides
  systems: {
    gridNodes: string;
    gridLines: string;
    shapeNodes: string;
    shapeEdges: string;
  };
}
```

## Three Core Themes

We use **established, proven themes** rather than inventing new palettes. Each theme's SVG rendering colors are derived from the editor syntax colors to maintain visual unity.

### 1. GitHub Dark (Default)

**Vibe**: Professional, familiar, widely adopted. The baseline.

**Source**: GitHub's official dark theme

```typescript
{
  name: "GitHub Dark",
  
  editor: {
    background: "#0d1117",
    text: "#e6edf3",
    comment: "#8b949e",
    keyword: "#ff7b72",         // red-orange
    method: "#d2a8ff",          // purple
    number: "#79c0ff",          // blue
    string: "#a5d6ff",          // light blue
    operator: "#ff7b72",
    selection: "#1f6feb33",
    cursor: "#58a6ff"
  },
  
  svg: {
    background: "#010409",      // slightly darker
    stroke: "#58a6ff",          // bright blue - matches numbers/cursor
    strokeWidth: 1.5,
    ephemeral: "#30363d",       // subtle gray
    grid: "#161b22",
    accent: "#f778ba"           // pink
  },
  
  systems: {
    gridNodes: "#58a6ff",       // blue
    gridLines: "#21262d",
    shapeNodes: "#d2a8ff",      // purple (matches methods)
    shapeEdges: "#30363d"
  }
}
```

### 2. Nord

**Vibe**: Muted chalkboard, calm, Scandinavian minimalism. Easy on eyes for long sessions.

**Source**: Nord theme (nordtheme.com)

```typescript
{
  name: "Nord",
  
  editor: {
    background: "#2e3440",      // dark blue-gray
    text: "#d8dee9",            // light gray
    comment: "#616e88",         // muted blue-gray
    keyword: "#81a1c1",         // muted blue
    method: "#88c0d0",          // cyan
    number: "#b48ead",          // muted purple
    string: "#a3be8c",          // muted green
    operator: "#81a1c1",
    selection: "#434c5e",
    cursor: "#88c0d0"
  },
  
  svg: {
    background: "#242933",      // slightly darker
    stroke: "#88c0d0",          // cyan - matches methods/cursor
    strokeWidth: 1.5,
    ephemeral: "#3b4252",       // subtle gray
    grid: "#2e3440",
    accent: "#bf616a"           // muted red
  },
  
  systems: {
    gridNodes: "#88c0d0",       // cyan
    gridLines: "#3b4252",
    shapeNodes: "#81a1c1",      // muted blue (matches keywords)
    shapeEdges: "#434c5e"
  }
}
```

### 3. Tokyo Night Storm

**Vibe**: Neon cyberpunk, saturated colors, high energy. Modern and eye-catching.

**Source**: Tokyo Night theme (popular VSCode theme)

```typescript
{
  name: "Tokyo Night Storm",
  
  editor: {
    background: "#24283b",      // dark purple-blue
    text: "#c0caf5",            // light blue-white
    comment: "#565f89",         // blue-gray
    keyword: "#bb9af7",         // bright purple
    method: "#7dcfff",          // bright cyan
    number: "#ff9e64",          // orange
    string: "#9ece6a",          // green
    operator: "#89ddff",        // bright cyan
    selection: "#364a82",
    cursor: "#c0caf5"
  },
  
  svg: {
    background: "#1a1b26",      // darker navy
    stroke: "#7dcfff",          // bright cyan - matches methods
    strokeWidth: 1.5,
    ephemeral: "#414868",       // muted blue-gray
    grid: "#1f2335",
    accent: "#f7768e"           // bright pink
  },
  
  systems: {
    gridNodes: "#7dcfff",       // cyan
    gridLines: "#292e42",
    shapeNodes: "#bb9af7",      // purple (matches keywords)
    shapeEdges: "#414868"
  }
}
```

## Theme Picker UI

### Location
Top-right corner, minimal footprint

### Interaction
- Small swatch showing current theme colors
- Click → dropdown with 3 theme options
- Each option shows: name + color preview strip
- Selection applies immediately (no confirm needed)
- Persists to localStorage

### Visual
```
┌──────────────────────┐
│ ● GitHub Dark    ✓   │  <- current theme
│ ● Nord              │
│ ● Tokyo Night Storm  │
└──────────────────────┘
```

Color preview shows: small colored circle (● using stroke color) + theme name

## Example Gallery

### Interaction
- **Trigger**: Button in bottom-right "Examples ↑"
- **Behavior**: Slides up from bottom (drawer style)
- **Dismissal**: Click outside, Escape, or ↓ button

### Content
Grid of example cards:

```
┌────────┬────────┬────────┬────────┐
│  Star  │  Gear  │  Grid  │ Spider │
│  [svg] │ [svg]  │ [svg]  │ [svg]  │
│ 1 line │ 1 line │ 2 lines│ 3 lines│
└────────┴────────┴────────┴────────┘
```

Each card:
- Thumbnail (rendered with current theme!)
- One-line description or code snippet
- Click → loads code into editor
- Doesn't overwrite unsaved work (prompt or new tab?)

### Categories
- **Basics**: circle, rect, star, rounded rect
- **Operations**: expand, extrude, raycast, connect
- **Grids**: simple grid, alternating, nested
- **Systems**: radial, star scaffold, hexagon pattern
- **Advanced**: spider web, network, complex compositions

## Keyboard Shortcuts

- `Cmd/Ctrl + E` - Open Export modal
- `Cmd/Ctrl + K` - Toggle construction geometry
- `Cmd/Ctrl + G` - Toggle grid overlay
- `Cmd/Ctrl + 0` - Reset view
- `Escape` - Close modal/drawer
- `Cmd/Ctrl + /` - Toggle comment
- `Tab` - Accept autocomplete

## Responsive Behavior

### Tablet/Landscape
- Keep split view
- Hamburger menu becomes full-height sidebar
- Modals become full-width sheets

### Mobile/Portrait
- **Single column**: Editor on top, preview below
- Swipe to switch between code/preview
- Hamburger menu becomes full-screen overlay
- Modals become full-screen

## Error Handling

### Philosophy
Errors are gentle nudges, not harsh failures

### Visual Treatment
- Inline red underline (subtle, not bright red)
- Hover shows error message in tooltip
- Preview shows last valid state (doesn't break)
- Suggestion for fix when possible

### Example
```
circle.raduis(5)  // typo
       ~~~~~~     // subtle red underline
       
Hover: "Did you mean 'radius'?"
```

## Performance Considerations

- Debounce preview updates (250ms)
- Limit re-renders during drag/pan
- Throttle zoom updates
- Lazy load example thumbnails
- Cache rendered SVGs for gallery

## Accessibility

- All controls keyboard accessible
- Theme colors meet WCAG AA contrast ratios
- Screen reader labels on all interactive elements
- Focus indicators visible in all themes
- Reduced motion option (disables animations)

## Future Enhancements (Phase 3+)

- **Step-through debugger**: Timeline scrubber showing each operation
- **Collaborative editing**: Share URLs, real-time cursors
- **Version history**: Cmd+Z through time
- **Export to code**: Generate standalone HTML/JS
- **Animation timeline**: Keyframe system for sequences
- **Custom themes**: User-created palettes
- **Shape library**: Save/reuse custom compositions

## Technical Stack Recommendations

- **Editor**: CodeMirror 6 (customizable, performant)
- **Preview**: SVG rendered directly to DOM
- **State**: Vanilla JS with custom event system, or lightweight signals (e.g., @preact/signals-core)
- **Framework**: **None** - vanilla JS with web components if needed, or Solid if absolutely necessary
- **Modals**: Custom lightweight implementation or headless-ui
- **Storage**: localStorage for themes/autosave/settings

**Philosophy**: No framework bloat. Keep bundle tiny. Vanilla JS can handle this.

## Design Principles

1. **Calm, not flashy** - Every pixel serves the work
2. **Code is geometry** - Visual unity through theming
3. **Immediate feedback** - See results as you type
4. **Minimal interface** - Single hamburger menu, modals for actions
5. **Progressive enhancement** - Features appear when needed
6. **Respect the craft** - Tools for makers, not consumers
7. **Dark by default** - Screen time should be gentle
8. **No blank canvas anxiety** - Always start with something