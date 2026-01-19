/**
 * Shared types used across all system implementations.
 */
import type { Vector2 } from './primitives/Vector2';
import type { Shape } from './primitives/Shape';
import type { PathStyle } from './collectors/SVGCollector';
/**
 * A shape placed at a specific position with optional styling.
 * Used by all systems that support place().
 */
export interface Placement {
    position: Vector2;
    shape: Shape;
    style?: PathStyle;
}
/**
 * Bounding box for a system's geometry.
 */
export interface SystemBounds {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}
/**
 * SVG output options.
 */
export interface SVGOptions {
    width: number;
    height: number;
    margin?: number;
}
