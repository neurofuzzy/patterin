import { Vector2 } from '../primitives/Vector2.ts';
import { Vertex } from '../primitives/Vertex.ts';
import { Segment } from '../primitives/Segment.ts';
import { Shape } from '../primitives/Shape.ts';
import { SVGCollector, PathStyle } from '../collectors/SVGCollector.ts';
import { PointsContext, LinesContext, ShapesContext, ShapeContext } from '../contexts/ShapeContext.ts';
import type { ISystem } from '../interfaces.ts';

export type TessellationPattern = 'truchet' | 'trihexagonal' | 'penrose' | 'custom';

export interface TessellationOptions {
    // Simple API
    size?: number;  // Tile size (default 40)
    // Detailed API (takes precedence)
    pattern?: TessellationPattern;
    bounds?: { width: number; height: number };
    seed?: number;
    // Truchet-specific
    tileSize?: number;
    variant?: 'quarter-circles' | 'diagonal' | 'triangles';
    // Trihexagonal-specific
    spacing?: number;
    // Penrose-specific
    iterations?: number;
    // Custom-specific
    unit?: ShapeContext;
    arrangement?: 'square' | 'hexagonal' | 'triangular';
}

interface TileInfo {
    shape: Shape;
    type: string;  // 'kite', 'dart', 'triangle', 'hexagon', etc.
}

/**
 * TessellationSystem - creates algorithmic tiling patterns.
 * Unlike GridSystem (regular infinite grids), TessellationSystem
 * handles patterns requiring algorithmic generation or randomization.
 */
export class TessellationSystem implements ISystem {
    private _tiles: TileInfo[] = [];
    private _nodes: Vector2[] = [];
    private _placements: { position: Vector2; shape: Shape; style?: PathStyle }[] = [];
    private _traced = false;
    private _bounds: { width: number; height: number };
    private _pattern: TessellationPattern;

    private constructor(options: TessellationOptions = {}) {
        // Support simple size API with defaults
        const pattern = options.pattern ?? 'truchet';
        const bounds = options.bounds ?? { width: 400, height: 400 };
        const tileSize = options.tileSize ?? options.size ?? 40;

        this._bounds = bounds;
        this._pattern = pattern;

        switch (pattern) {
            case 'truchet':
                this.buildTruchet({ ...options, pattern, bounds, tileSize });
                break;
            case 'trihexagonal':
                this.buildTrihexagonal({ ...options, pattern, bounds });
                break;
            case 'penrose':
                this.buildPenrose({ ...options, pattern, bounds });
                break;
            case 'custom':
                this.buildCustom({ ...options, pattern, bounds });
                break;
        }
    }

    static create(options: TessellationOptions): TessellationSystem {
        return new TessellationSystem(options);
    }

    // ==================== Seeded Random ====================

    private seededRandom(seed: number): () => number {
        let state = seed;
        return () => {
            state = (state * 1103515245 + 12345) & 0x7fffffff;
            return state / 0x7fffffff;
        };
    }

    // ==================== Truchet Pattern ====================

    private buildTruchet(options: TessellationOptions): void {
        const tileSize = options.tileSize ?? 20;
        const variant = options.variant ?? 'quarter-circles';
        const random = this.seededRandom(options.seed ?? 12345);

        const cols = Math.ceil(this._bounds.width / tileSize);
        const rows = Math.ceil(this._bounds.height / tileSize);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * tileSize;
                const y = row * tileSize;
                const rotation = Math.floor(random() * 4) * 90;

                const tile = this.createTruchetTile(variant, tileSize, x, y, rotation);
                tile.ephemeral = true;
                this._tiles.push({ shape: tile, type: variant });
                this._nodes.push(new Vector2(x + tileSize / 2, y + tileSize / 2));
            }
        }
    }

    private createTruchetTile(
        variant: string,
        size: number,
        x: number,
        y: number,
        rotation: number
    ): Shape {
        const center = new Vector2(x + size / 2, y + size / 2);
        let shape: Shape;

        switch (variant) {
            case 'diagonal': {
                // Thin diagonal strip across tile
                const thickness = size * 0.1;
                const dx = thickness / Math.sqrt(2);
                shape = Shape.fromPoints([
                    new Vector2(x - dx, y + dx),
                    new Vector2(x + dx, y - dx),
                    new Vector2(x + size + dx, y + size - dx),
                    new Vector2(x + size - dx, y + size + dx),
                ]);
                break;
            }

            case 'triangles':
                // Half-square triangle
                shape = Shape.fromPoints([
                    new Vector2(x, y),
                    new Vector2(x + size, y),
                    new Vector2(x, y + size),
                ]);
                break;

            case 'quarter-circles':
            default: {
                // Approximate quarter circles with arcs
                const segments = 8;
                const points: Vector2[] = [];
                const r = size / 2;

                // Arc from top-left corner
                for (let i = 0; i <= segments; i++) {
                    const angle = (i / segments) * (Math.PI / 2);
                    points.push(new Vector2(
                        x + Math.cos(angle) * r,
                        y + Math.sin(angle) * r
                    ));
                }
                // Arc from bottom-right corner
                for (let i = 0; i <= segments; i++) {
                    const angle = Math.PI + (i / segments) * (Math.PI / 2);
                    points.push(new Vector2(
                        x + size + Math.cos(angle) * r,
                        y + size + Math.sin(angle) * r
                    ));
                }

                shape = Shape.fromPoints(points);
                break;
            }
        }

        // Apply rotation around center
        if (rotation !== 0) {
            shape.rotate(rotation * Math.PI / 180, center);
        }

        return shape;
    }

    // ==================== Trihexagonal Pattern ====================

    private buildTrihexagonal(options: TessellationOptions): void {
        const spacing = options.spacing ?? 30;
        const hexRadius = spacing / 2;
        const triSide = hexRadius;

        // Hexagonal grid spacing
        const horizSpacing = spacing * Math.sqrt(3);
        const vertSpacing = spacing * 1.5;

        const cols = Math.ceil(this._bounds.width / horizSpacing) + 1;
        const rows = Math.ceil(this._bounds.height / vertSpacing) + 1;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const xOffset = (row % 2) * horizSpacing / 2;
                const cx = col * horizSpacing + xOffset;
                const cy = row * vertSpacing;

                // Skip if outside bounds
                if (cx < -spacing || cx > this._bounds.width + spacing) continue;
                if (cy < -spacing || cy > this._bounds.height + spacing) continue;

                // Create hexagon at center
                const hex = Shape.regularPolygon(6, hexRadius, new Vector2(cx, cy), Math.PI / 6);
                hex.ephemeral = true;
                this._tiles.push({ shape: hex, type: 'hexagon' });
                this._nodes.push(new Vector2(cx, cy));

                // Create triangles in the gaps
                // 6 triangles around each hexagon
                const hexVertices = hex.vertices;
                for (let i = 0; i < 6; i++) {
                    const v1 = hexVertices[i].position;
                    const v2 = hexVertices[(i + 1) % 6].position;

                    // Triangle pointing outward
                    const outDir = v1.add(v2).divide(2).subtract(new Vector2(cx, cy)).normalize();
                    const triPeak = v1.add(v2).divide(2).add(outDir.multiply(triSide * 0.866));

                    const tri = Shape.fromPoints([v1, v2, triPeak]);
                    tri.ephemeral = true;
                    this._tiles.push({ shape: tri, type: 'triangle' });
                }
            }
        }
    }

    // ==================== Penrose Pattern ====================

    private buildPenrose(options: TessellationOptions): void {
        const iterations = options.iterations ?? 4;

        // Golden ratio
        const PHI = (1 + Math.sqrt(5)) / 2;

        // Robinson triangle: color 0 = red (36° apex), color 1 = blue (108° apex)
        interface Triangle {
            color: 0 | 1;  // 0 = red, 1 = blue
            a: Vector2;   // apex
            b: Vector2;   // base left
            c: Vector2;   // base right
        }

        const cx = this._bounds.width / 2;
        const cy = this._bounds.height / 2;
        const radius = Math.max(this._bounds.width, this._bounds.height) * 0.6;

        // Create wheel of 10 red triangles around the origin (Preshing method)
        let triangles: Triangle[] = [];
        for (let i = 0; i < 10; i++) {
            const angle1 = (2 * i - 1) * Math.PI / 10;
            const angle2 = (2 * i + 1) * Math.PI / 10;

            let b = new Vector2(cx + Math.cos(angle1) * radius, cy + Math.sin(angle1) * radius);
            let c = new Vector2(cx + Math.cos(angle2) * radius, cy + Math.sin(angle2) * radius);

            // Mirror every second triangle
            if (i % 2 === 0) {
                [b, c] = [c, b];
            }

            triangles.push({ color: 0, a: new Vector2(cx, cy), b, c });
        }

        // Deflation (subdivision) - following Preshing's algorithm
        for (let iter = 0; iter < iterations; iter++) {
            const newTriangles: Triangle[] = [];

            for (const tri of triangles) {
                if (tri.color === 0) {
                    // Subdivide red triangle (36° apex) into 1 red + 1 blue
                    // P = A + (B - A) / goldenRatio
                    const p = tri.a.add(tri.b.subtract(tri.a).divide(PHI));

                    newTriangles.push({ color: 0, a: tri.c, b: p, c: tri.b });
                    newTriangles.push({ color: 1, a: p, b: tri.c, c: tri.a });
                } else {
                    // Subdivide blue triangle (108° apex) into 2 blue + 1 red
                    // Q = B + (A - B) / goldenRatio
                    // R = B + (C - B) / goldenRatio
                    const q = tri.b.add(tri.a.subtract(tri.b).divide(PHI));
                    const r = tri.b.add(tri.c.subtract(tri.b).divide(PHI));

                    newTriangles.push({ color: 1, a: r, b: tri.c, c: tri.a });
                    newTriangles.push({ color: 1, a: q, b: r, c: tri.b });
                    newTriangles.push({ color: 0, a: r, b: q, c: tri.a });
                }
            }

            triangles = newTriangles;
        }

        // Convert triangles to tiles
        for (const tri of triangles) {
            // Clip to bounds
            const center = tri.a.add(tri.b).add(tri.c).divide(3);
            if (center.x < 0 || center.x > this._bounds.width) continue;
            if (center.y < 0 || center.y > this._bounds.height) continue;

            const shape = Shape.fromPoints([tri.a, tri.b, tri.c]);
            shape.ephemeral = true;

            // Red triangles form kites, blue triangles form darts
            const tileType = tri.color === 0 ? 'kite' : 'dart';
            this._tiles.push({ shape, type: tileType });
            this._nodes.push(center);
        }
    }

    // ==================== Custom Pattern ====================

    private buildCustom(options: TessellationOptions): void {
        if (!options.unit) {
            throw new Error('Custom tessellation requires a unit shape');
        }

        const spacing = options.spacing ?? 40;
        const arrangement = options.arrangement ?? 'square';
        const unit = options.unit.shape;

        // Use grid arrangement
        const cols = Math.ceil(this._bounds.width / spacing) + 1;
        const rows = Math.ceil(this._bounds.height / spacing) + 1;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let x: number, y: number;

                if (arrangement === 'hexagonal') {
                    const horizSpacing = spacing * Math.sqrt(3);
                    const xOffset = (row % 2) * horizSpacing / 2;
                    x = col * horizSpacing + xOffset;
                    y = row * spacing * 0.75;
                } else if (arrangement === 'triangular') {
                    const height = spacing * Math.sqrt(3) / 2;
                    x = col * spacing / 2;
                    y = row * height;
                } else {
                    x = col * spacing;
                    y = row * spacing;
                }

                if (x > this._bounds.width + spacing || y > this._bounds.height + spacing) continue;

                const clone = unit.clone();
                clone.moveTo(new Vector2(x, y));
                clone.ephemeral = true;
                this._tiles.push({ shape: clone, type: 'custom' });
                this._nodes.push(new Vector2(x, y));
            }
        }
    }

    // ==================== Getters ====================

    /** Get all tiles as ShapesContext */
    get tiles(): ShapesContext {
        const shapes = this._tiles.map(t => t.shape.clone());
        return new ShapesContext(shapes);
    }

    /** Get all nodes as PointsContext */
    get nodes(): PointsContext {
        const vertices = this._nodes.map(n => new Vertex(n.x, n.y));
        const refShape = this._tiles[0]?.shape ?? Shape.regularPolygon(3, 1);
        return new PointsContext(refShape, vertices);
    }

    /** Get all edges as LinesContext */
    get edges(): LinesContext {
        const segments: Segment[] = [];
        const refShape = this._tiles[0]?.shape ?? Shape.regularPolygon(3, 1);

        for (const tile of this._tiles) {
            for (const seg of tile.shape.segments) {
                segments.push(new Segment(
                    new Vertex(seg.start.x, seg.start.y),
                    new Vertex(seg.end.x, seg.end.y)
                ));
            }
        }

        return new LinesContext(refShape, segments);
    }

    // Pattern-specific getters
    get kites(): ShapesContext {
        const shapes = this._tiles.filter(t => t.type === 'kite').map(t => t.shape.clone());
        return new ShapesContext(shapes);
    }

    get darts(): ShapesContext {
        const shapes = this._tiles.filter(t => t.type === 'dart').map(t => t.shape.clone());
        return new ShapesContext(shapes);
    }

    get triangles(): ShapesContext {
        const shapes = this._tiles.filter(t => t.type === 'triangle').map(t => t.shape.clone());
        return new ShapesContext(shapes);
    }

    get hexagons(): ShapesContext {
        const shapes = this._tiles.filter(t => t.type === 'hexagon').map(t => t.shape.clone());
        return new ShapesContext(shapes);
    }

    // ==================== Tracing ====================

    /** Make tiles concrete (renderable) */
    trace(): this {
        this._traced = true;
        for (const tile of this._tiles) {
            tile.shape.ephemeral = false;
        }
        return this;
    }

    /** Place a shape at each node in the system */
    place(shapeCtx: ShapeContext, style?: PathStyle): this {
        for (const node of this._nodes) {
            const clone = shapeCtx.shape.clone();
            clone.ephemeral = false;  // Clones are concrete
            clone.moveTo(node);
            this._placements.push({ position: node, shape: clone, style });
        }

        // Mark source shape as ephemeral AFTER cloning (construction geometry)
        shapeCtx.shape.ephemeral = true;

        return this;
    }

    /** Clip system to mask shape boundary */
    mask(maskShape: ShapeContext): this {
        // Mark mask as ephemeral (construction geometry)
        maskShape.shape.ephemeral = true;

        const shape = maskShape.shape;

        // Filter tiles to those with centroids inside the mask
        this._tiles = this._tiles.filter(tile =>
            shape.containsPoint(tile.shape.centroid())
        );

        // Filter nodes to those inside the mask
        this._nodes = this._nodes.filter(node =>
            shape.containsPoint(node)
        );

        // Filter placements to those inside the mask
        this._placements = this._placements.filter(p =>
            shape.containsPoint(p.position)
        );

        return this;
    }


    /** Stamp system to collector (for auto-rendering) */
    stamp(collector: SVGCollector, style?: PathStyle): void {
        const finalStyle = style ?? { stroke: '#999', strokeWidth: 1 };

        for (const tile of this._tiles) {
            if (!tile.shape.ephemeral) {
                collector.addShape(tile.shape, finalStyle);
            }
        }

        // Add placements
        for (const p of this._placements) {
            collector.addShape(p.shape, p.style ?? finalStyle);
        }
    }

    // ==================== Export ====================

    /** Generate SVG output */
    toSVG(options: {
        width: number;
        height: number;
        margin?: number;
    }): string {
        const { width, height, margin = 10 } = options;
        const collector = new SVGCollector();

        const renderables = this._tiles.filter(t => !t.shape.ephemeral);

        if (renderables.length === 0) {
            return collector.toString({ width, height });
        }

        // Compute bounds
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        for (const tile of renderables) {
            const bbox = tile.shape.boundingBox();
            minX = Math.min(minX, bbox.min.x);
            minY = Math.min(minY, bbox.min.y);
            maxX = Math.max(maxX, bbox.max.x);
            maxY = Math.max(maxY, bbox.max.y);
        }

        const contentWidth = maxX - minX || 1;
        const contentHeight = maxY - minY || 1;

        // Scale to fit
        const availW = width - margin * 2;
        const availH = height - margin * 2;
        const scale = Math.min(availW / contentWidth, availH / contentHeight);

        // Center offset
        const offsetX = margin + (availW - contentWidth * scale) / 2 - minX * scale;
        const offsetY = margin + (availH - contentHeight * scale) / 2 - minY * scale;

        // Render
        for (const tile of renderables) {
            const clone = tile.shape.clone();
            clone.scale(scale);
            clone.translate(new Vector2(offsetX, offsetY));
            collector.addShape(clone, { stroke: '#999', strokeWidth: 1 });
        }

        return collector.toString({ width, height });
    }
}
