import { describe, it, expect } from 'vitest';
import { Segment } from '../../src/primitives/Segment.ts';
import { Vertex } from '../../src/primitives/Vertex.ts';

describe('Segment', () => {
    describe('constructor', () => {
        it('should create segment with start and end vertices', () => {
            const v0 = new Vertex(0, 0);
            const v1 = new Vertex(1, 0);
            const seg = new Segment(v0, v1);

            expect(seg.start).toBe(v0);
            expect(seg.end).toBe(v1);
        });

        it('should link vertices to segment', () => {
            const v0 = new Vertex(0, 0);
            const v1 = new Vertex(1, 0);
            const seg = new Segment(v0, v1);

            expect(v0.nextSegment).toBe(seg);
            expect(v1.prevSegment).toBe(seg);
        });
    });

    describe('length', () => {
        it('should compute segment length', () => {
            const v0 = new Vertex(0, 0);
            const v1 = new Vertex(3, 4);
            const seg = new Segment(v0, v1);

            expect(seg.length()).toBe(5);
        });
    });

    describe('direction', () => {
        it('should compute unit direction', () => {
            const v0 = new Vertex(0, 0);
            const v1 = new Vertex(3, 4);
            const seg = new Segment(v0, v1);
            const dir = seg.direction();

            expect(dir.length()).toBeCloseTo(1, 10);
            expect(dir.x).toBeCloseTo(0.6, 10);
            expect(dir.y).toBeCloseTo(0.8, 10);
        });
    });

    describe('midpoint', () => {
        it('should compute midpoint', () => {
            const v0 = new Vertex(0, 0);
            const v1 = new Vertex(10, 20);
            const seg = new Segment(v0, v1);
            const mid = seg.midpoint();

            expect(mid.x).toBe(5);
            expect(mid.y).toBe(10);
        });
    });

    describe('normal', () => {
        it('should compute CCW normal pointing outward (right of direction)', () => {
            const v0 = new Vertex(0, 0);
            const v1 = new Vertex(1, 0);
            const seg = new Segment(v0, v1);
            seg.winding = 'ccw';
            const n = seg.normal;

            expect(n.x).toBeCloseTo(0, 10);
            expect(n.y).toBeCloseTo(-1, 10);
        });

        it('should compute CW normal pointing outward (left of direction)', () => {
            const v0 = new Vertex(0, 0);
            const v1 = new Vertex(1, 0);
            const seg = new Segment(v0, v1);
            seg.winding = 'cw';
            const n = seg.normal;

            expect(n.x).toBeCloseTo(0, 10);
            expect(n.y).toBeCloseTo(1, 10);
        });
    });

    describe('pointAt', () => {
        it('should return start at t=0', () => {
            const v0 = new Vertex(0, 0);
            const v1 = new Vertex(10, 10);
            const seg = new Segment(v0, v1);
            const p = seg.pointAt(0);

            expect(p.x).toBe(0);
            expect(p.y).toBe(0);
        });

        it('should return end at t=1', () => {
            const v0 = new Vertex(0, 0);
            const v1 = new Vertex(10, 10);
            const seg = new Segment(v0, v1);
            const p = seg.pointAt(1);

            expect(p.x).toBe(10);
            expect(p.y).toBe(10);
        });

        it('should interpolate at t=0.5', () => {
            const v0 = new Vertex(0, 0);
            const v1 = new Vertex(10, 10);
            const seg = new Segment(v0, v1);
            const p = seg.pointAt(0.5);

            expect(p.x).toBe(5);
            expect(p.y).toBe(5);
        });
    });

    describe('isDegenerate', () => {
        it('should return true for zero-length segment', () => {
            const v0 = new Vertex(5, 5);
            const v1 = new Vertex(5, 5);
            const seg = new Segment(v0, v1);

            expect(seg.isDegenerate()).toBe(true);
        });

        it('should return false for non-zero length segment', () => {
            const v0 = new Vertex(0, 0);
            const v1 = new Vertex(1, 0);
            const seg = new Segment(v0, v1);

            expect(seg.isDegenerate()).toBe(false);
        });
    });

    describe('intersect', () => {
        it('should find intersection of crossing segments', () => {
            const seg1 = new Segment(new Vertex(0, 0), new Vertex(10, 10));
            const seg2 = new Segment(new Vertex(0, 10), new Vertex(10, 0));
            const intersection = seg1.intersect(seg2);

            expect(intersection).not.toBeNull();
            expect(intersection!.x).toBeCloseTo(5, 10);
            expect(intersection!.y).toBeCloseTo(5, 10);
        });

        it('should return null for parallel segments', () => {
            const seg1 = new Segment(new Vertex(0, 0), new Vertex(10, 0));
            const seg2 = new Segment(new Vertex(0, 5), new Vertex(10, 5));
            const intersection = seg1.intersect(seg2);

            expect(intersection).toBeNull();
        });

        it('should return null for non-intersecting segments', () => {
            const seg1 = new Segment(new Vertex(0, 0), new Vertex(1, 0));
            const seg2 = new Segment(new Vertex(5, 5), new Vertex(6, 5));
            const intersection = seg1.intersect(seg2);

            expect(intersection).toBeNull();
        });
    });

    describe('clone', () => {
        it('should create independent copy', () => {
            const v0 = new Vertex(0, 0);
            const v1 = new Vertex(1, 0);
            const seg = new Segment(v0, v1);
            const clone = seg.clone();

            expect(clone.start.x).toBe(0);
            expect(clone.end.x).toBe(1);

            clone.start.x = 10;
            expect(seg.start.x).toBe(0);
        });
    });
});
