/**
 * Examples Index
 * 
 * Catalog of all Patterin examples with metadata.
 * Useful for documentation generation and the playground.
 */

export interface ExampleMetadata {
  id: string;
  category: string;
  name: string;
  description: string;
  file: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  concepts: string[];
}

export const EXAMPLES: ExampleMetadata[] = [
  // ============================================================================
  // 01. BASICS
  // ============================================================================
  {
    id: 'circle',
    category: 'Basics',
    name: 'Circle',
    description: 'The simplest example: create a circle and render it to SVG',
    file: '01-basics/circle.ts',
    complexity: 'beginner',
    concepts: ['shape factory', 'SVG output'],
  },
  {
    id: 'star',
    category: 'Basics',
    name: 'Star',
    description: 'Create a star by modifying alternating points of a circle',
    file: '01-basics/star.ts',
    complexity: 'beginner',
    concepts: ['context switching', 'point manipulation'],
  },
  {
    id: 'gear',
    category: 'Basics',
    name: 'Gear',
    description: 'Create a gear by extruding alternating edges of a circle',
    file: '01-basics/gear.ts',
    complexity: 'beginner',
    concepts: ['line context', 'edge extrusion'],
  },
  {
    id: 'multiple-shapes',
    category: 'Basics',
    name: 'Multiple Shapes',
    description: 'Position multiple shapes in a composition',
    file: '01-basics/multiple-shapes.ts',
    complexity: 'beginner',
    concepts: ['positioning', 'composition'],
  },

  // ============================================================================
  // 02. TRANSFORMATIONS
  // ============================================================================
  {
    id: 'clone-grid',
    category: 'Transformations',
    name: 'Clone Grid',
    description: 'Create a 2D grid by chaining clone operations',
    file: '02-transformations/clone-grid.ts',
    complexity: 'beginner',
    concepts: ['cloning', 'nested operations'],
  },
  {
    id: 'offset-rings',
    category: 'Transformations',
    name: 'Offset Rings',
    description: 'Create concentric shapes using offset operations',
    file: '02-transformations/offset-rings.ts',
    complexity: 'intermediate',
    concepts: ['offset', 'inset', 'outset'],
  },
  {
    id: 'scale-rotate',
    category: 'Transformations',
    name: 'Scale and Rotate',
    description: 'Combine scaling and rotation to create patterns',
    file: '02-transformations/scale-rotate.ts',
    complexity: 'beginner',
    concepts: ['scale', 'rotate', 'loops'],
  },
  {
    id: 'subset-transforms',
    category: 'Transformations',
    name: 'Subset Transforms',
    description: 'Apply transformations to selected shapes in a collection',
    file: '02-transformations/subset-transforms.ts',
    complexity: 'intermediate',
    concepts: ['selection', 'every', 'checkerboard'],
  },

  // ============================================================================
  // 03. CONTEXTS
  // ============================================================================
  {
    id: 'point-expansion',
    category: 'Contexts',
    name: 'Point Expansion',
    description: 'Create stars by expanding selected points radially',
    file: '03-contexts/point-expansion.ts',
    complexity: 'intermediate',
    concepts: ['points context', 'radial expansion'],
  },
  {
    id: 'point-circles',
    category: 'Contexts',
    name: 'Point Circles',
    description: 'Place circles at each vertex of a polygon',
    file: '03-contexts/point-circles.ts',
    complexity: 'intermediate',
    concepts: ['expandToCircles', 'mandala'],
  },
  {
    id: 'line-extrusion',
    category: 'Contexts',
    name: 'Line Extrusion',
    description: 'Extrude specific edges to create complex shapes',
    file: '03-contexts/line-extrusion.ts',
    complexity: 'intermediate',
    concepts: ['lines context', 'edge selection'],
  },
  {
    id: 'polar-spread',
    category: 'Contexts',
    name: 'Polar Spread',
    description: 'Distribute shapes around a circle for radial patterns',
    file: '03-contexts/polar-spread.ts',
    complexity: 'intermediate',
    concepts: ['spreadPolar', 'radial distribution'],
  },

  // ============================================================================
  // 04. GRIDS
  // ============================================================================
  {
    id: 'square-grid',
    category: 'Grids',
    name: 'Square Grid',
    description: 'Create a basic square grid using the grid system',
    file: '04-grids/square-grid.ts',
    complexity: 'beginner',
    concepts: ['grid system', 'placement'],
  },
  {
    id: 'hex-grid',
    category: 'Grids',
    name: 'Hexagonal Grid',
    description: 'Create a hexagonal grid pattern',
    file: '04-grids/hex-grid.ts',
    complexity: 'beginner',
    concepts: ['hexagonal grid', 'honeycomb'],
  },
  {
    id: 'triangular-grid',
    category: 'Grids',
    name: 'Triangular Grid',
    description: 'Create a triangular grid pattern',
    file: '04-grids/triangular-grid.ts',
    complexity: 'beginner',
    concepts: ['triangular grid', 'tessellation'],
  },
  {
    id: 'grid-placement',
    category: 'Grids',
    name: 'Grid Placement',
    description: 'Place different shapes at grid points',
    file: '04-grids/grid-placement.ts',
    complexity: 'intermediate',
    concepts: ['grid system', 'shape placement', 'variation'],
  },

  // ============================================================================
  // 05. TESSELLATIONS
  // ============================================================================
  {
    id: 'penrose',
    category: 'Tessellations',
    name: 'Penrose Tiling',
    description: 'Generate aperiodic Penrose tiling patterns',
    file: '05-tessellations/penrose.ts',
    complexity: 'advanced',
    concepts: ['penrose', 'aperiodic', 'mathematical'],
  },
  {
    id: 'trihexagonal',
    category: 'Tessellations',
    name: 'Trihexagonal',
    description: 'Create trihexagonal (hexagons and triangles) tiling',
    file: '05-tessellations/trihexagonal.ts',
    complexity: 'intermediate',
    concepts: ['semi-regular', 'trihexagonal'],
  },

  // ============================================================================
  // 06. FRACTALS
  // ============================================================================
  {
    id: 'koch-curve',
    category: 'Fractals',
    name: 'Koch Curve',
    description: 'Generate a Koch curve fractal',
    file: '06-fractals/koch-curve.ts',
    complexity: 'intermediate',
    concepts: ['L-system', 'fractal', 'self-similarity'],
  },
  {
    id: 'koch-snowflake',
    category: 'Fractals',
    name: 'Koch Snowflake',
    description: 'Generate the famous Koch snowflake fractal',
    file: '06-fractals/koch-snowflake.ts',
    complexity: 'intermediate',
    concepts: ['L-system', 'closed curve', 'fractal'],
  },
  {
    id: 'dragon-curve',
    category: 'Fractals',
    name: 'Dragon Curve',
    description: 'Generate the Heighway dragon fractal',
    file: '06-fractals/dragon-curve.ts',
    complexity: 'intermediate',
    concepts: ['L-system', 'space-filling', 'fractal'],
  },
  {
    id: 'hilbert-curve',
    category: 'Fractals',
    name: 'Hilbert Curve',
    description: 'Generate a Hilbert space-filling curve',
    file: '06-fractals/hilbert-curve.ts',
    complexity: 'advanced',
    concepts: ['L-system', 'space-filling', 'locality'],
  },
  {
    id: 'sierpinski',
    category: 'Fractals',
    name: 'Sierpiński Triangle',
    description: 'Generate a Sierpiński arrowhead curve',
    file: '06-fractals/sierpinski.ts',
    complexity: 'intermediate',
    concepts: ['L-system', 'fractal', 'triangle'],
  },
  {
    id: 'fractal-plant',
    category: 'Fractals',
    name: 'Fractal Plant',
    description: 'Generate an organic branching plant structure',
    file: '06-fractals/fractal-plant.ts',
    complexity: 'advanced',
    concepts: ['L-system', 'branching', 'organic', 'stack'],
  },

  // ============================================================================
  // 07. ADVANCED
  // ============================================================================
  {
    id: 'mandala-complex',
    category: 'Advanced',
    name: 'Complex Mandala',
    description: 'Intricate mandala combining multiple techniques',
    file: '07-advanced/mandala-complex.ts',
    complexity: 'advanced',
    concepts: ['composition', 'layering', 'radial', 'complexity'],
  },
  {
    id: 'grid-with-offsets',
    category: 'Advanced',
    name: 'Grid with Offsets',
    description: 'Grid with subset offset patterns',
    file: '07-advanced/grid-with-offsets.ts',
    complexity: 'advanced',
    concepts: ['grid', 'selection', 'offset', 'composition'],
  },
  {
    id: 'geometric-pattern',
    category: 'Advanced',
    name: 'Geometric Pattern',
    description: 'Complex geometric composition with multiple layers',
    file: '07-advanced/geometric-pattern.ts',
    complexity: 'advanced',
    concepts: ['composition', 'layering', 'symmetry', 'detail'],
  },
  {
    id: 'plotter-art',
    category: 'Advanced',
    name: 'Plotter Art',
    description: 'Design optimized for pen plotting',
    file: '07-advanced/plotter-art.ts',
    complexity: 'advanced',
    concepts: ['plotter', 'fabrication', 'line-art', 'precision'],
  },
];

/**
 * Get examples by category
 */
export function getExamplesByCategory(category: string): ExampleMetadata[] {
  return EXAMPLES.filter((ex) => ex.category === category);
}

/**
 * Get examples by complexity
 */
export function getExamplesByComplexity(
  complexity: 'beginner' | 'intermediate' | 'advanced'
): ExampleMetadata[] {
  return EXAMPLES.filter((ex) => ex.complexity === complexity);
}

/**
 * Get example by ID
 */
export function getExampleById(id: string): ExampleMetadata | undefined {
  return EXAMPLES.find((ex) => ex.id === id);
}

/**
 * Get all categories
 */
export function getCategories(): string[] {
  return [...new Set(EXAMPLES.map((ex) => ex.category))];
}
