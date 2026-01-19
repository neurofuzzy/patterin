# Patterin Examples

This directory contains runnable examples demonstrating Patterin's capabilities, organized by complexity and concept.

## Running Examples

Each example is a standalone TypeScript file that generates SVG output in the `examples/output/` directory.

```bash
# Install dependencies first
npm install

# Run any example - output goes to examples/output/
npx tsx examples/01-basics/circle.ts
# ✓ Generated: examples/output/circle.svg

# Run multiple examples
npx tsx examples/01-basics/star.ts
npx tsx examples/06-fractals/dragon-curve.ts
npx tsx examples/07-advanced/mandala-complex.ts

# View the generated files
ls examples/output/
open examples/output/star.svg  # macOS
xdg-open examples/output/star.svg  # Linux
```

All SVG files are generated in `examples/output/` (which is git-ignored).

## Examples by Category

### 01. Basics
Simple shapes and fundamental operations to get started.

- `circle.ts` - Create a basic circle
- `star.ts` - Star shape from modified circle points
- `gear.ts` - Gear from extruded circle edges
- `multiple-shapes.ts` - Position multiple shapes

### 02. Transformations
Shape manipulation: cloning, scaling, rotating, offsetting.

- `clone-grid.ts` - 2D grid via nested cloning
- `offset-rings.ts` - Concentric offset copies
- `scale-rotate.ts` - Combined transformations
- `subset-transforms.ts` - Transform specific shapes in a collection

### 03. Contexts
Point and line manipulation for detailed control.

- `point-expansion.ts` - Expand points to create stars
- `point-circles.ts` - Place circles at vertices (mandala)
- `line-extrusion.ts` - Extrude specific edges
- `polar-spread.ts` - Distribute shapes radially

### 04. Grids
Grid systems for structured layouts.

- `square-grid.ts` - Basic square grid
- `hex-grid.ts` - Hexagonal grid pattern
- `triangular-grid.ts` - Triangular grid
- `grid-placement.ts` - Place shapes at grid nodes

### 05. Tessellations
Tiling patterns and tessellations.

- `truchet-tiles.ts` - Random Truchet patterns
- `penrose.ts` - Aperiodic Penrose tiling
- `trihexagonal.ts` - Trihexagonal tessellation

### 06. Fractals
L-systems for fractal generation.

- `koch-curve.ts` - Koch curve fractal
- `koch-snowflake.ts` - Closed Koch snowflake
- `dragon-curve.ts` - Heighway dragon fractal
- `hilbert-curve.ts` - Space-filling Hilbert curve
- `sierpinski.ts` - Sierpiński triangle
- `fractal-plant.ts` - Branching plant structure

### 07. Advanced
Complex compositions combining multiple techniques.

- `mandala-complex.ts` - Multi-ring mandala with varied shapes
- `grid-with-offsets.ts` - Grid with subset offset patterns
- `geometric-pattern.ts` - Complex geometric composition
- `plotter-art.ts` - Design optimized for pen plotting

## Tips

- **Output to file**: Redirect stdout to save SVG files
- **Visual inspection**: Open generated SVG files in a browser or editor
- **Experimentation**: Modify parameters to explore variations
- **Playground**: Try examples in the [live playground](https://neurofuzzy.github.io/patterin/playground) for instant feedback

## Related Documentation

- [API Reference](../API.md) - Complete API documentation
- [README](../README.md) - Project overview and quick start
- [Playground](https://neurofuzzy.github.io/patterin/playground) - Interactive coding environment
