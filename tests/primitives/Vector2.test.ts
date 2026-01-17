import { describe, it, expect } from 'vitest';
import { Vector2 } from '../../src/primitives/Vector2.ts';

describe('Vector2', () => {
    describe('constructor', () => {
        it('should create a vector with x and y', () => {
            const v = new Vector2(3, 4);
            expect(v.x).toBe(3);
            expect(v.y).toBe(4);
        });
    });

    describe('add', () => {
        it('should add two vectors', () => {
            const a = new Vector2(1, 2);
            const b = new Vector2(3, 4);
            const result = a.add(b);
            expect(result.x).toBe(4);
            expect(result.y).toBe(6);
        });

        it('should not mutate original vectors', () => {
            const a = new Vector2(1, 2);
            const b = new Vector2(3, 4);
            a.add(b);
            expect(a.x).toBe(1);
            expect(a.y).toBe(2);
        });
    });

    describe('subtract', () => {
        it('should subtract two vectors', () => {
            const a = new Vector2(5, 7);
            const b = new Vector2(2, 3);
            const result = a.subtract(b);
            expect(result.x).toBe(3);
            expect(result.y).toBe(4);
        });
    });

    describe('multiply', () => {
        it('should multiply by scalar', () => {
            const v = new Vector2(2, 3);
            const result = v.multiply(4);
            expect(result.x).toBe(8);
            expect(result.y).toBe(12);
        });
    });

    describe('divide', () => {
        it('should divide by scalar', () => {
            const v = new Vector2(8, 12);
            const result = v.divide(4);
            expect(result.x).toBe(2);
            expect(result.y).toBe(3);
        });

        it('should return zero for division by zero', () => {
            const v = new Vector2(5, 10);
            const result = v.divide(0);
            expect(result.x).toBe(0);
            expect(result.y).toBe(0);
        });
    });

    describe('length', () => {
        it('should compute length of 3-4-5 triangle', () => {
            const v = new Vector2(3, 4);
            expect(v.length()).toBe(5);
        });

        it('should return 0 for zero vector', () => {
            const v = new Vector2(0, 0);
            expect(v.length()).toBe(0);
        });
    });

    describe('normalize', () => {
        it('should normalize to unit length', () => {
            const v = new Vector2(3, 4);
            const n = v.normalize();
            expect(n.length()).toBeCloseTo(1, 10);
            expect(n.x).toBeCloseTo(0.6, 10);
            expect(n.y).toBeCloseTo(0.8, 10);
        });

        it('should return zero for zero vector', () => {
            const v = new Vector2(0, 0);
            const n = v.normalize();
            expect(n.x).toBe(0);
            expect(n.y).toBe(0);
        });
    });

    describe('dot', () => {
        it('should compute dot product', () => {
            const a = new Vector2(2, 3);
            const b = new Vector2(4, 5);
            expect(a.dot(b)).toBe(23);
        });

        it('should return 0 for perpendicular vectors', () => {
            const a = new Vector2(1, 0);
            const b = new Vector2(0, 1);
            expect(a.dot(b)).toBe(0);
        });
    });

    describe('cross', () => {
        it('should compute 2D cross product', () => {
            const a = new Vector2(2, 3);
            const b = new Vector2(4, 5);
            expect(a.cross(b)).toBe(-2);
        });
    });

    describe('angle', () => {
        it('should return 0 for positive x', () => {
            const v = new Vector2(1, 0);
            expect(v.angle()).toBe(0);
        });

        it('should return PI/2 for positive y', () => {
            const v = new Vector2(0, 1);
            expect(v.angle()).toBeCloseTo(Math.PI / 2, 10);
        });

        it('should return PI for negative x', () => {
            const v = new Vector2(-1, 0);
            expect(v.angle()).toBeCloseTo(Math.PI, 10);
        });
    });

    describe('rotate', () => {
        it('should rotate 90 degrees', () => {
            const v = new Vector2(1, 0);
            const rotated = v.rotate(Math.PI / 2);
            expect(rotated.x).toBeCloseTo(0, 10);
            expect(rotated.y).toBeCloseTo(1, 10);
        });

        it('should rotate 180 degrees', () => {
            const v = new Vector2(1, 0);
            const rotated = v.rotate(Math.PI);
            expect(rotated.x).toBeCloseTo(-1, 10);
            expect(rotated.y).toBeCloseTo(0, 10);
        });
    });

    describe('perpendicular', () => {
        it('should return CCW perpendicular', () => {
            const v = new Vector2(1, 0);
            const perp = v.perpendicular();
            expect(perp.x).toBeCloseTo(0, 10);
            expect(perp.y).toBeCloseTo(1, 10);
        });
    });

    describe('perpendicularCW', () => {
        it('should return CW perpendicular', () => {
            const v = new Vector2(1, 0);
            const perp = v.perpendicularCW();
            expect(perp.x).toBeCloseTo(0, 10);
            expect(perp.y).toBeCloseTo(-1, 10);
        });
    });

    describe('lerp', () => {
        it('should interpolate between vectors', () => {
            const a = new Vector2(0, 0);
            const b = new Vector2(10, 20);
            const mid = a.lerp(b, 0.5);
            expect(mid.x).toBe(5);
            expect(mid.y).toBe(10);
        });
    });

    describe('equals', () => {
        it('should return true for equal vectors', () => {
            const a = new Vector2(1, 2);
            const b = new Vector2(1, 2);
            expect(a.equals(b)).toBe(true);
        });

        it('should return false for different vectors', () => {
            const a = new Vector2(1, 2);
            const b = new Vector2(1, 3);
            expect(a.equals(b)).toBe(false);
        });

        it('should use epsilon for comparison', () => {
            const a = new Vector2(1, 2);
            const b = new Vector2(1 + 1e-11, 2);
            expect(a.equals(b)).toBe(true);
        });
    });

    describe('static methods', () => {
        it('zero should return (0, 0)', () => {
            const v = Vector2.zero();
            expect(v.x).toBe(0);
            expect(v.y).toBe(0);
        });

        it('fromAngle should create vector from angle', () => {
            const v = Vector2.fromAngle(0);
            expect(v.x).toBeCloseTo(1, 10);
            expect(v.y).toBeCloseTo(0, 10);
        });
    });
});
