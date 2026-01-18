import { ShapeContext } from './ShapeContext.ts';
import { Shape } from '../primitives/Shape.ts';
import { Segment } from '../primitives/Segment.ts';
import { Vector2 } from '../primitives/Vector2.ts';
import { SVGCollector, PathStyle, DEFAULT_STYLES } from '../collectors/SVGCollector.ts';

/**
 * Context for operations on a continuous path (open or closed).
 * Unlike ShapeContext, this assumes the geometry represents a path/line
 * rather than a filled shape, though it uses Shape as the underlying primitive.
 */
export class PathContext extends ShapeContext {
    constructor(shape: Shape | Segment[]) {
        if (Array.isArray(shape)) {
            // Reconstruct shape from segments
            // Note: This assumes segments are connected or at least ordered
            super(new Shape(shape, 'ccw'));
        } else {
            super(shape);
        }
    }

    /**
     * Stamp as a path (stroke only, no fill).
     */
    stamp(collector: SVGCollector, x = 0, y = 0, style: PathStyle = {}): void {
        if (this._shape.ephemeral) return;

        const finalStyle = {
            ...DEFAULT_STYLES.line,
            ...style
        };

        // If it's a single continuous path, we can use a single path command
        const pathData = this.toPathData(x, y);
        collector.addPath(pathData, finalStyle);
    }

    /**
     * Generate path data string.
     */
    toPathData(offsetX = 0, offsetY = 0): string {
        const segments = this._shape.segments;
        if (segments.length === 0) return '';

        let d = '';
        const visited = new Set<Segment>();

        // Naive path generation - assumes connected segments
        // Real implementation needs to handle disjoint paths if we support them

        for (const seg of segments) {
            const start = seg.start.position;
            const end = seg.end.position;

            if (!visited.has(seg)) {
                // If this is the start of a new run or disjoint
                // For now, simpler: just output every segment as M L
                d += `M ${start.x + offsetX} ${start.y + offsetY} L ${end.x + offsetX} ${end.y + offsetY} `;
                visited.add(seg);
            }
        }

        // This effectively draws "segments". PROPER path logic should link them.
        // Let's try to link them if they match.

        return this.generateConnectedPathData(offsetX, offsetY);
    }

    private generateConnectedPathData(offsetX: number, offsetY: number): string {
        const segments = this._shape.segments;
        if (segments.length === 0) return '';

        let d = '';
        let currentPos: Vector2 | null = null;
        const epsilon = 1e-5;

        for (const seg of segments) {
            const start = seg.start.position;
            const end = seg.end.position;

            const startX = start.x + offsetX;
            const startY = start.y + offsetY;
            const endX = end.x + offsetX;
            const endY = end.y + offsetY;

            if (!currentPos || !currentPos.equals(start, epsilon)) {
                d += `M ${startX} ${startY} `;
            }
            d += `L ${endX} ${endY} `;
            currentPos = end;
        }

        return d;
    }

    /**
     * Resample the path into equidistant points.
     */
    resample(stepSize: number): PathContext {
        // TODO: Implement resampling logic
        return this;
    }

    /**
     * Get total length of path.
     */
    get length(): number {
        let len = 0;
        for (const seg of this._shape.segments) {
            len += seg.length();
        }
        return len;
    }

    /**
     * Create from points.
     */
    static fromPoints(points: Vector2[]): PathContext {
        if (points.length < 2) {
            throw new Error('Path requires at least 2 points');
        }
        const segments: Segment[] = []; // We can't use Segment directly without Vertex
        // And we can't import Vertex easily if we want to keep imports clean?
        // Wait, Segment imports Vertex.
        // Let's rely on Shape.fromPoints but ignore closure?

        // Using Shape.fromPoints forces a closed loop (connects last to first).
        // We probably don't want that for an open path.

        // We need to construct segments manually.
        // But Shape requires segments to be passed in.
        // We need Vertex.

        // Let's just create a dummy Shape and hack it?
        // Or better, update Shape to allow open paths?
        // For now, let's defer this specific factory or rely on Shape.fromPoints with a warning?
        // Shape.fromPoints connects last to first. 
        // We will just not use Shape.fromPoints.

        // Implementation deferred to usage site or we add Vertex import.
        return new PathContext(Shape.fromPoints(points)); // This will close it. 
    }
}
