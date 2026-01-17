/**
 * Immutable 2D vector class for geometry operations.
 */
export class Vector2 {
    constructor(
        public readonly x: number,
        public readonly y: number
    ) { }

    /** Add another vector */
    add(other: Vector2): Vector2 {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    /** Subtract another vector */
    subtract(other: Vector2): Vector2 {
        return new Vector2(this.x - other.x, this.y - other.y);
    }

    /** Multiply by a scalar */
    multiply(scalar: number): Vector2 {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    /** Divide by a scalar */
    divide(scalar: number): Vector2 {
        if (scalar === 0) {
            return new Vector2(0, 0);
        }
        return new Vector2(this.x / scalar, this.y / scalar);
    }

    /** Normalize to unit length */
    normalize(): Vector2 {
        const len = this.length();
        if (len === 0) {
            return new Vector2(0, 0);
        }
        return this.divide(len);
    }

    /** Dot product with another vector */
    dot(other: Vector2): number {
        return this.x * other.x + this.y * other.y;
    }

    /** Cross product (2D returns scalar z-component) */
    cross(other: Vector2): number {
        return this.x * other.y - this.y * other.x;
    }

    /** Length of the vector */
    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    /** Squared length (faster, no sqrt) */
    lengthSquared(): number {
        return this.x * this.x + this.y * this.y;
    }

    /** Angle in radians from positive x-axis */
    angle(): number {
        return Math.atan2(this.y, this.x);
    }

    /** Distance to another point */
    distanceTo(other: Vector2): number {
        return this.subtract(other).length();
    }

    /** Rotate by angle in radians */
    rotate(angle: number): Vector2 {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector2(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        );
    }

    /** Get perpendicular vector (90° CCW rotation) */
    perpendicular(): Vector2 {
        return new Vector2(-this.y, this.x);
    }

    /** Get perpendicular vector (90° CW rotation) */
    perpendicularCW(): Vector2 {
        return new Vector2(this.y, -this.x);
    }

    /** Linear interpolation to another vector */
    lerp(other: Vector2, t: number): Vector2 {
        return new Vector2(
            this.x + (other.x - this.x) * t,
            this.y + (other.y - this.y) * t
        );
    }

    /** Check equality within epsilon */
    equals(other: Vector2, epsilon = 1e-10): boolean {
        return (
            Math.abs(this.x - other.x) < epsilon &&
            Math.abs(this.y - other.y) < epsilon
        );
    }

    /** Negate the vector */
    negate(): Vector2 {
        return new Vector2(-this.x, -this.y);
    }

    /** Clone this vector */
    clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    /** String representation */
    toString(): string {
        return `Vector2(${this.x}, ${this.y})`;
    }

    // Static factory methods
    static zero(): Vector2 {
        return new Vector2(0, 0);
    }

    static one(): Vector2 {
        return new Vector2(1, 1);
    }

    static up(): Vector2 {
        return new Vector2(0, -1);
    }

    static down(): Vector2 {
        return new Vector2(0, 1);
    }

    static left(): Vector2 {
        return new Vector2(-1, 0);
    }

    static right(): Vector2 {
        return new Vector2(1, 0);
    }

    /** Create from angle in radians */
    static fromAngle(angle: number): Vector2 {
        return new Vector2(Math.cos(angle), Math.sin(angle));
    }
}
