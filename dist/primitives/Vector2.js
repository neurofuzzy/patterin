/**
 * Immutable 2D vector class for geometry operations.
 */
export class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    /** Add another vector */
    add(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }
    /** Subtract another vector */
    subtract(other) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }
    /** Multiply by a scalar */
    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }
    /** Divide by a scalar */
    divide(scalar) {
        if (scalar === 0) {
            return new Vector2(0, 0);
        }
        return new Vector2(this.x / scalar, this.y / scalar);
    }
    /** Normalize to unit length */
    normalize() {
        const len = this.length();
        if (len === 0) {
            return new Vector2(0, 0);
        }
        return this.divide(len);
    }
    /** Dot product with another vector */
    dot(other) {
        return this.x * other.x + this.y * other.y;
    }
    /** Cross product (2D returns scalar z-component) */
    cross(other) {
        return this.x * other.y - this.y * other.x;
    }
    /** Length of the vector */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    /** Squared length (faster, no sqrt) */
    lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }
    /** Angle in radians from positive x-axis */
    angle() {
        return Math.atan2(this.y, this.x);
    }
    /** Distance to another point */
    distanceTo(other) {
        return this.subtract(other).length();
    }
    /** Rotate by angle in radians */
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector2(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
    }
    /** Get perpendicular vector (90° CCW rotation) */
    perpendicular() {
        return new Vector2(-this.y, this.x);
    }
    /** Get perpendicular vector (90° CW rotation) */
    perpendicularCW() {
        return new Vector2(this.y, -this.x);
    }
    /** Linear interpolation to another vector */
    lerp(other, t) {
        return new Vector2(this.x + (other.x - this.x) * t, this.y + (other.y - this.y) * t);
    }
    /** Check equality within epsilon */
    equals(other, epsilon = 1e-10) {
        return (Math.abs(this.x - other.x) < epsilon &&
            Math.abs(this.y - other.y) < epsilon);
    }
    /** Negate the vector */
    negate() {
        return new Vector2(-this.x, -this.y);
    }
    /** Clone this vector */
    clone() {
        return new Vector2(this.x, this.y);
    }
    /** String representation */
    toString() {
        return `Vector2(${this.x}, ${this.y})`;
    }
    // Static factory methods
    static zero() {
        return new Vector2(0, 0);
    }
    static one() {
        return new Vector2(1, 1);
    }
    static up() {
        return new Vector2(0, -1);
    }
    static down() {
        return new Vector2(0, 1);
    }
    static left() {
        return new Vector2(-1, 0);
    }
    static right() {
        return new Vector2(1, 0);
    }
    /** Create from angle in radians */
    static fromAngle(angle) {
        return new Vector2(Math.cos(angle), Math.sin(angle));
    }
}
