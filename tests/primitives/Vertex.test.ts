import { describe, it, expect } from 'vitest';
import { Vertex } from '../../src/primitives/Vertex.ts';
import { Segment } from '../../src/primitives/Segment.ts';
import { Vector2 } from '../../src/primitives/Vector2.ts';

describe('Vertex', () => {
    describe('constructor', () => {
        it('should create a vertex with x and y', () => {
            const v = new Vertex(3, 4);
            expect(v.x).toBe(3);
            expect(v.y).toBe(4);
        });
    });

    describe('position', () => {
        it('should return position as Vector2', () => {
            const v = new Vertex(3, 4);
            const pos = v.position;
            expect(pos).toBeInstanceOf(Vector2);
            expect(pos.x).toBe(3);
            expect(pos.y).toBe(4);
        });

        it('should update position from Vector2', () => {
            const v = new Vertex(0, 0);
            v.position = new Vector2(5, 6);
            expect(v.x).toBe(5);
            expect(v.y).toBe(6);
        });
    });

    describe('normal computation', () => {
        it('should return zero for isolated vertex', () => {
            const v = new Vertex(0, 0);
            const n = v.normal;
            expect(n.x).toBe(0);
            expect(n.y).toBe(0);
        });

        it('should average adjacent segment normals', () => {
            const v0 = new Vertex(0, 0);
            const v1 = new Vertex(1, 0);
            const v2 = new Vertex(1, 1);

            const seg1 = new Segment(v0, v1);
            const seg2 = new Segment(v1, v2);
            seg1.winding = 'ccw';
            seg2.winding = 'ccw';

            const n = v1.normal;
            expect(n.length()).toBeCloseTo(1, 5);
        });
    });

    describe('clone', () => {
        it('should create independent copy', () => {
            const v = new Vertex(3, 4);
            const clone = v.clone();
            expect(clone.x).toBe(3);
            expect(clone.y).toBe(4);

            clone.x = 10;
            expect(v.x).toBe(3);
        });
    });

    describe('equals', () => {
        it('should return true for same position', () => {
            const a = new Vertex(1, 2);
            const b = new Vertex(1, 2);
            expect(a.equals(b)).toBe(true);
        });

        it('should return false for different positions', () => {
            const a = new Vertex(1, 2);
            const b = new Vertex(1, 3);
            expect(a.equals(b)).toBe(false);
        });
    });

    describe('fromVector', () => {
        it('should create vertex from Vector2', () => {
            const vec = new Vector2(5, 6);
            const v = Vertex.fromVector(vec);
            expect(v.x).toBe(5);
            expect(v.y).toBe(6);
        });
    });
});
