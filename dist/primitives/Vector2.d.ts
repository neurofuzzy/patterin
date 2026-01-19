/**
 * Immutable 2D vector class for geometry operations.
 */
export declare class Vector2 {
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number);
    /** Add another vector */
    add(other: Vector2): Vector2;
    /** Subtract another vector */
    subtract(other: Vector2): Vector2;
    /** Multiply by a scalar */
    multiply(scalar: number): Vector2;
    /** Divide by a scalar */
    divide(scalar: number): Vector2;
    /** Normalize to unit length */
    normalize(): Vector2;
    /** Dot product with another vector */
    dot(other: Vector2): number;
    /** Cross product (2D returns scalar z-component) */
    cross(other: Vector2): number;
    /** Length of the vector */
    length(): number;
    /** Squared length (faster, no sqrt) */
    lengthSquared(): number;
    /** Angle in radians from positive x-axis */
    angle(): number;
    /** Distance to another point */
    distanceTo(other: Vector2): number;
    /** Rotate by angle in radians */
    rotate(angle: number): Vector2;
    /** Get perpendicular vector (90° CCW rotation) */
    perpendicular(): Vector2;
    /** Get perpendicular vector (90° CW rotation) */
    perpendicularCW(): Vector2;
    /** Linear interpolation to another vector */
    lerp(other: Vector2, t: number): Vector2;
    /** Check equality within epsilon */
    equals(other: Vector2, epsilon?: number): boolean;
    /** Negate the vector */
    negate(): Vector2;
    /** Clone this vector */
    clone(): Vector2;
    /** String representation */
    toString(): string;
    static zero(): Vector2;
    static one(): Vector2;
    static up(): Vector2;
    static down(): Vector2;
    static left(): Vector2;
    static right(): Vector2;
    /** Create from angle in radians */
    static fromAngle(angle: number): Vector2;
}
