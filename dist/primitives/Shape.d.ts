import { Vector2 } from './Vector2';
import { Vertex } from './Vertex';
import { Segment, Winding } from './Segment';
export interface BoundingBox {
    min: Vector2;
    max: Vector2;
    width: number;
    height: number;
    center: Vector2;
}
/**
 * A closed loop of connected segments with consistent winding.
 */
export declare class Shape {
    segments: Segment[];
    winding: Winding;
    /** Flag for construction geometry that won't render */
    ephemeral: boolean;
    /** Optional group/role identifier for color layering */
    group?: string;
    /** Optional color for this shape (hex string) */
    color?: string;
    constructor(segments: Segment[], winding?: Winding);
    /** Get unique vertices in winding order */
    get vertices(): Vertex[];
    /** Check if the shape forms a closed loop */
    get closed(): boolean;
    /** Number of vertices/segments */
    get length(): number;
    /**
     * Compute signed area of the shape.
     * Positive for CCW, negative for CW.
     */
    area(): number;
    /** Compute centroid of the shape */
    centroid(): Vector2;
    /** Compute bounding box */
    boundingBox(): BoundingBox;
    /**
     * Reverse winding direction.
     * Flips CW to CCW or vice versa.
     */
    reverse(): void;
    /** Connect segments in a loop (prev/next references) */
    connectSegments(): void;
    /** Validate shape invariants */
    validate(): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Remove degenerate (zero-length) segments.
     * Updates connectivity after removal.
     */
    removeDegenerate(epsilon?: number): void;
    /** Clone this shape with new vertices and segments */
    clone(): Shape;
    /** Scale shape around origin or center */
    scale(factor: number, center?: Vector2): void;
    /** Rotate shape around origin or center */
    rotate(angle: number, center?: Vector2): void;
    /** Translate shape by offset */
    translate(offset: Vector2): void;
    /** Move shape so centroid is at position */
    moveTo(position: Vector2): void;
    /**
     * Test if a point is inside the shape using ray casting algorithm.
     * Uses y-axis jitter to avoid exact vertex intersection issues.
     */
    containsPoint(point: Vector2, epsilon?: number): boolean;
    /** Check if point is near any vertex */
    private isNearVertex;
    /** Internal ray casting implementation */
    private containsPointInternal;
    /** Flag for open paths (no closing Z) */
    open: boolean;
    /**
     * Convert shape to SVG path data string.
     */
    toPathData(): string;
    /** String representation */
    toString(): string;
    /**
     * Create a shape from an array of points.
     * Points should be in order (CCW for standard winding).
     */
    static fromPoints(points: Vector2[], winding?: Winding): Shape;
    /**
     * Create a regular polygon with n sides.
     */
    static regularPolygon(n: number, radius: number, center?: Vector2, rotationOffset?: number): Shape;
}
