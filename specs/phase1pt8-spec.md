# Phase 1.8: L-System

## Overview

Phase 1.8 adds **LSystemSystem** for generating fractal and organic patterns using Lindenmayer systems (L-systems). L-systems use formal grammars to recursively generate self-similar structures - perfect for plants, fractals, and space-filling curves.

## Core Principles

- **Not closed shapes** - L-systems generate paths, not closed polygons
- **System only** - LSystemSystem, not a shape (paths are open)
- **Turtle graphics** - Uses turtle interpretation (forward, turn, push/pop state)
- **Deterministic** - Same axiom + rules = same output
- **Traceable** - Like other systems, can be traced to concrete geometry

## LSystemSystem API

```javascript
LSystemSystem.create({
  axiom: 'F',           // starting string
  rules: {              // production rules
    'F': 'F+F-F-F+F'
  },
  iterations: 3,        // recursion depth
  angle: 90,            // turn angle in degrees
  length: 10,           // step length
  origin?: [x, y],      // starting position
  heading?: 0           // initial direction (degrees)
})
```

### Parameters

**`axiom`** (string)
- The initial string/seed
- Example: `'F'`, `'X'`, `'F++F++F'`

**`rules`** (object)
- Production rules for rewriting
- Keys: symbols to replace
- Values: replacement strings
- Example: `{ 'F': 'F+F-F-F+F' }`

**`iterations`** (number)
- How many times to apply rules recursively
- More iterations = more detail/complexity
- Typical range: 2-6

**`angle`** (number)
- Turn angle in degrees
- Example: 90 (square), 60 (triangle), 25 (organic)

**`length`** (number)
- Distance for each forward step
- Can decrease per iteration for fractal scaling

**`origin`** (optional [x, y])
- Starting position
- Default: [0, 0]

**`heading`** (optional number)
- Initial direction in degrees
- 0° = right, 90° = up
- Default: 0

## Turtle Commands

L-system strings are interpreted as turtle graphics commands:

| Symbol | Command | Description |
|--------|---------|-------------|
| `F` | Forward | Draw line forward by `length` |
| `f` | Move | Move forward without drawing |
| `+` | Turn right | Rotate by `+angle` |
| `-` | Turn left | Rotate by `-angle` |
| `[` | Push | Save current position/heading |
| `]` | Pop | Restore saved position/heading |
| `\|` | Turn around | Rotate 180° |

**Other symbols** (like `X`, `Y`, `A`, `B`) are **non-drawing** - used only for rule expansion.

## Queryable Elements

**`.path`** → PathContext (ephemeral)
- Complete path as single continuous line
- Includes all segments in order

**`.segments`** → LinesContext (ephemeral)
- Individual line segments
- Each forward (`F`) command creates a segment

**`.nodes`** → PointsContext (ephemeral)
- Vertices where segments meet
- Includes branch points from `[` `]` operations

**`.endpoints`** → PointsContext (ephemeral)
- Terminal points (dead ends)
- Useful for placing shapes at branch tips

## Tracing

Like other systems, L-systems can be traced:

```javascript
const lsys = LSystemSystem.create({
  axiom: 'F',
  rules: { 'F': 'F+F-F-F+F' },
  iterations: 3,
  angle: 90,
  length: 10
});

// Trace entire path
lsys.trace();
lsys.path.stamp(svg, 0, 0);

// Trace only segments
lsys.segments.trace();

// Place shapes at endpoints
lsys.endpoints.place(circle.radius(2));
```

## Classic L-Systems

### Koch Curve

Single iteration of the classic fractal.

```javascript
LSystemSystem.create({
  axiom: 'F',
  rules: { 'F': 'F+F-F-F+F' },
  iterations: 3,
  angle: 90,
  length: 10
})
```

**Pattern:**
```
Iteration 0: ─
Iteration 1: ┌─┐
              │
Iteration 2: More complex square wave
```

### Koch Snowflake

Closed triangular variant.

```javascript
LSystemSystem.create({
  axiom: 'F++F++F',    // three sides
  rules: { 'F': 'F-F++F-F' },
  iterations: 4,
  angle: 60,
  length: 8
})
```

### Fractal Plant

Organic branching structure using stack operations.

```javascript
LSystemSystem.create({
  axiom: 'X',
  rules: {
    'X': 'F+[[X]-X]-F[-FX]+X',
    'F': 'FF'
  },
  iterations: 5,
  angle: 25,
  length: 5
})
```

**Pattern:** Tree-like with bilateral branching

### Dragon Curve

Space-filling fractal with elegant simplicity.

```javascript
LSystemSystem.create({
  axiom: 'F',
  rules: {
    'F': 'F+G',
    'G': 'F-G'
  },
  iterations: 10,
  angle: 90,
  length: 5
})
```

### Hilbert Curve

Space-filling curve (maps 1D to 2D).

```javascript
LSystemSystem.create({
  axiom: 'A',
  rules: {
    'A': '-BF+AFA+FB-',
    'B': '+AF-BFB-FA+'
  },
  iterations: 5,
  angle: 90,
  length: 10
})
```

### Sierpiński Triangle

Arrowhead variant using only turns.

```javascript
LSystemSystem.create({
  axiom: 'F',
  rules: {
    'F': 'G-F-G',
    'G': 'F+G+F'
  },
  iterations: 6,
  angle: 60,
  length: 5
})
```

### Gosper Curve (Flowsnake)

Hexagonal space-filling curve.

```javascript
LSystemSystem.create({
  axiom: 'F',
  rules: {
    'F': 'F+G++G-F--FF-G+',
    'G': '-F+GG++G+F--F-G'
  },
  iterations: 4,
  angle: 60,
  length: 8
})
```

## Implementation Algorithm

### String Rewriting

```javascript
function applyRules(axiom, rules, iterations) {
  let current = axiom;
  
  for (let i = 0; i < iterations; i++) {
    let next = '';
    for (let char of current) {
      next += rules[char] || char;  // apply rule or keep char
    }
    current = next;
  }
  
  return current;
}
```

### Turtle Interpretation

```javascript
function interpretTurtle(lstring, angle, length, origin, heading) {
  const segments = [];
  const nodes = [];
  const endpoints = [];
  
  let x = origin[0];
  let y = origin[1];
  let dir = heading * Math.PI / 180;  // convert to radians
  const stack = [];
  
  for (let char of lstring) {
    switch (char) {
      case 'F':  // draw forward
        const newX = x + Math.cos(dir) * length;
        const newY = y + Math.sin(dir) * length;
        segments.push(new Segment(
          new Vertex(x, y),
          new Vertex(newX, newY)
        ));
        nodes.push(new Vertex(x, y));
        x = newX;
        y = newY;
        break;
        
      case 'f':  // move forward (no draw)
        x += Math.cos(dir) * length;
        y += Math.sin(dir) * length;
        break;
        
      case '+':  // turn right
        dir += angle * Math.PI / 180;
        break;
        
      case '-':  // turn left
        dir -= angle * Math.PI / 180;
        break;
        
      case '[':  // push state
        stack.push({ x, y, dir });
        break;
        
      case ']':  // pop state
        endpoints.push(new Vertex(x, y));  // current point is endpoint
        const state = stack.pop();
        x = state.x;
        y = state.y;
        dir = state.dir;
        break;
        
      case '|':  // turn around
        dir += Math.PI;
        break;
        
      // Other chars (X, Y, A, B, etc.) are ignored in rendering
    }
  }
  
  // Final position is an endpoint
  endpoints.push(new Vertex(x, y));
  
  return { segments, nodes, endpoints };
}
```

### Complete Pipeline

```javascript
class LSystemSystem {
  create(config) {
    // 1. Rewrite string
    const lstring = applyRules(
      config.axiom, 
      config.rules, 
      config.iterations
    );
    
    // 2. Interpret as turtle graphics
    const { segments, nodes, endpoints } = interpretTurtle(
      lstring,
      config.angle,
      config.length,
      config.origin || [0, 0],
      config.heading || 0
    );
    
    // 3. Create queryable contexts
    this.segments = new LinesContext(segments);
    this.nodes = new PointsContext(nodes);
    this.endpoints = new PointsContext(endpoints);
    this.path = new PathContext(segments);  // connected path
    
    // All ephemeral by default
    this.segments.ephemeral = true;
    this.nodes.ephemeral = true;
    this.endpoints.ephemeral = true;
    this.path.ephemeral = true;
  }
}
```

## Advanced Features (Optional)

### Stochastic L-Systems

Multiple rules with probabilities (Phase 2):

```javascript
rules: {
  'F': [
    { rule: 'F[+F]F[-F]F', weight: 0.33 },
    { rule: 'F[+F]F', weight: 0.33 },
    { rule: 'F[-F]F', weight: 0.34 }
  ]
}
```

### Parametric L-Systems

Length/angle can change based on context (Phase 2):

```javascript
rules: {
  'F(l)': 'F(l*0.8)[+F(l*0.5)][-F(l*0.5)]F(l*0.8)'
}
```

### Context-Sensitive Rules

Rules depend on neighbors (Phase 2):

```javascript
rules: {
  'A < B > C': 'X'  // B becomes X only if preceded by A and followed by C
}
```

## Example Patterns

### Plant with Leaves

```javascript
const plant = LSystemSystem.create({
  axiom: 'X',
  rules: {
    'X': 'F+[[X]-X]-F[-FX]+X',
    'F': 'FF'
  },
  iterations: 5,
  angle: 25,
  length: 5
});

plant.segments.trace().stamp(svg, 0, 0, { stroke: '#2d5016' });
plant.endpoints.place(circle.radius(3).fill('#90EE90'));
```

### Hilbert Space-Filling

```javascript
const hilbert = LSystemSystem.create({
  axiom: 'A',
  rules: {
    'A': '-BF+AFA+FB-',
    'B': '+AF-BFB-FA+'
  },
  iterations: 5,
  angle: 90,
  length: 10
});

hilbert.path.trace().stamp(svg, 0, 0, { 
  stroke: '#333',
  strokeWidth: 2
});
```

### Koch Snowflake with Grid

```javascript
const snowflake = LSystemSystem.create({
  axiom: 'F++F++F',
  rules: { 'F': 'F-F++F-F' },
  iterations: 4,
  angle: 60,
  length: 8
});

const grid = GridSystem.create({ type: 'hexagonal', rows: 3, cols: 3 });

grid.nodes.forEach(node => {
  // Place snowflake at each hex center
  snowflake.trace().stamp(svg, node.x, node.y);
});
```

### Dragon Curve Variations

```javascript
const dragon = LSystemSystem.create({
  axiom: 'F',
  rules: { 'F': 'F+G', 'G': 'F-G' },
  iterations: 10,
  angle: 90,
  length: 5
});

// Show iterations
for (let i = 1; i <= 10; i++) {
  const d = LSystemSystem.create({
    axiom: 'F',
    rules: { 'F': 'F+G', 'G': 'F-G' },
    iterations: i,
    angle: 90,
    length: 5
  });
  d.trace().stamp(svg, i * 100, 0);
}
```

### Branching with Nodes

```javascript
const tree = LSystemSystem.create({
  axiom: 'F',
  rules: { 'F': 'F[+F]F[-F][F]' },
  iterations: 4,
  angle: 20,
  length: 10
});

tree.segments.trace().stamp(svg, 0, 0, { stroke: '#654321' });
tree.nodes.place(circle.radius(2).fill('#8b4513'));
tree.endpoints.place(circle.radius(4).fill('#228b22'));
```

## Testing Requirements

- [ ] String rewriting applies rules correctly
- [ ] Multiple iterations work
- [ ] Turtle interpretation creates correct segments
- [ ] Forward (F) draws, move (f) doesn't
- [ ] Turn commands (+, -) work correctly
- [ ] Stack operations ([, ]) preserve/restore state
- [ ] Branching creates separate paths
- [ ] Endpoints detected correctly
- [ ] Koch curve generates correctly
- [ ] Koch snowflake closes properly
- [ ] Fractal plant has bilateral symmetry
- [ ] Dragon curve tiles space-filling
- [ ] Hilbert curve fills square
- [ ] Trace makes paths concrete
- [ ] Segments can be stamped individually
- [ ] Nodes and endpoints queryable
- [ ] Visual tests for all classic L-systems

## Phase 1.8 Definition of Done

- ✅ LSystemSystem implemented
- ✅ String rewriting engine works
- ✅ Turtle graphics interpreter works
- ✅ All turtle commands supported (F, f, +, -, [, ], |)
- ✅ Queryable: path, segments, nodes, endpoints
- ✅ Traceable to concrete geometry
- ✅ Classic L-systems work (Koch, Dragon, Hilbert, Plant, etc.)
- ✅ Visual tests for each classic pattern
- ✅ Documentation with examples
- ✅ Integration with placement (endpoints.place())

## Future Enhancements (Phase 2+)

- Stochastic rules (probability-based)
- Parametric L-systems (changing length/angle)
- Context-sensitive rules (neighbor-aware)
- 3D L-systems (with pitch/roll/yaw)
- Animation (grow over time with sequences)

## References

**Foundational:**
- [The Algorithmic Beauty of Plants](http://algorithmicbotany.org/papers/#abop) - Przemysław Prusinkiewicz (THE book on L-systems)
- [L-Systems Wikipedia](https://en.wikipedia.org/wiki/L-system)

**Implementations:**
- [l-system-visualizer](https://github.com/nylki/lindenmayer) - Good reference implementation
- [Paul Bourke - L-Systems](http://paulbourke.net/fractals/lsys/) - Detailed examples

**Interactives:**
- [L-System Studio](https://www.kevs3d.co.uk/dev/lsystems/) - Visual explorer
- [Algorithmic Botany](http://algorithmicbotany.org/lstudio/) - Original L-Studio software

**Tutorials:**
- [Nature of Code - L-Systems](https://natureofcode.com/book/chapter-8-fractals/#chapter08_section6)
- [The Coding Train - Fractal Trees](https://thecodingtrain.com/challenges/14-fractal-trees-recursive) (similar concepts)
