import { describe, it, expect } from 'vitest';
import { Shape } from '../../src/primitives/Shape.ts';
import { Vector2 } from '../../src/primitives/Vector2.ts';

describe('Shape', () => {
    describe('fromPoints', () => {
        it('should create a triangle from 3 points', () => {
            const points = [
                new Vector2(0, 0),
                new Vector2(10, 0),
                new Vector2(5, 10),
            ];
            const shape = Shape.fromPoints(points);

            expect(shape.segments.length).toBe(3);
            expect(shape.vertices.length).toBe(3);
        });

        it('should create a square from 4 points', () => {
            const points = [
                new Vector2(0, 0),
                new Vector2(10, 0),
                new Vector2(10, 10),
                new Vector2(0, 10),
            ];
            const shape = Shape.fromPoints(points);

            expect(shape.segments.length).toBe(4);
        });

        it('should throw for fewer than 3 points', () => {
            expect(() =>
                Shape.fromPoints([new Vector2(0, 0), new Vector2(1, 0)])
            ).toThrow();
        });
    });

    describe('regularPolygon', () => {
        it('should create a hexagon with 6 segments', () => {
            const hex = Shape.regularPolygon(6, 10);
            expect(hex.segments.length).toBe(6);
        });

        it('should create a triangle with 3 segments', () => {
            const tri = Shape.regularPolygon(3, 10);
            expect(tri.segments.length).toBe(3);
        });

        it('should throw for n < 3', () => {
            expect(() => Shape.regularPolygon(2, 10)).toThrow();
        });
    });

    describe('closed', () => {
        it('should be closed for valid shape', () => {
            const shape = Shape.regularPolygon(4, 10);
            shape.connectSegments();
            expect(shape.closed).toBe(true);
        });
    });

    describe('area', () => {
        it('should compute positive area for CCW winding', () => {
            const points = [
                new Vector2(0, 0),
                new Vector2(10, 0),
                new Vector2(10, 10),
                new Vector2(0, 10),
            ];
            const shape = Shape.fromPoints(points, 'ccw');

            expect(shape.area()).toBeCloseTo(100, 5);
        });

        it('should compute negative area for CW winding', () => {
            const points = [
                new Vector2(0, 0),
                new Vector2(0, 10),
                new Vector2(10, 10),
                new Vector2(10, 0),
            ];
            const shape = Shape.fromPoints(points, 'cw');

            expect(shape.area()).toBeCloseTo(-100, 5);
        });
    });

    describe('centroid', () => {
        it('should compute centroid of square at center', () => {
            const points = [
                new Vector2(0, 0),
                new Vector2(10, 0),
                new Vector2(10, 10),
                new Vector2(0, 10),
            ];
            const shape = Shape.fromPoints(points);
            const c = shape.centroid();

            expect(c.x).toBe(5);
            expect(c.y).toBe(5);
        });
    });

    describe('boundingBox', () => {
        it('should compute bounding box', () => {
            const points = [
                new Vector2(0, 0),
                new Vector2(10, 0),
                new Vector2(10, 10),
                new Vector2(0, 10),
            ];
            const shape = Shape.fromPoints(points);
            const bbox = shape.boundingBox();

            expect(bbox.min.x).toBe(0);
            expect(bbox.min.y).toBe(0);
            expect(bbox.max.x).toBe(10);
            expect(bbox.max.y).toBe(10);
            expect(bbox.width).toBe(10);
            expect(bbox.height).toBe(10);
            expect(bbox.center.x).toBe(5);
            expect(bbox.center.y).toBe(5);
        });
    });

    describe('reverse', () => {
        it('should flip winding direction', () => {
            const shape = Shape.regularPolygon(4, 10);
            expect(shape.winding).toBe('ccw');

            shape.reverse();
            expect(shape.winding).toBe('cw');
        });

        it('should update segment order', () => {
            const points = [
                new Vector2(0, 0),
                new Vector2(10, 0),
                new Vector2(10, 10),
            ];
            const shape = Shape.fromPoints(points);

            shape.reverse();

            const newFirst = shape.vertices[0].position;
            expect(newFirst.x).toBe(10);
            expect(newFirst.y).toBe(10);
        });
    });

    describe('clone', () => {
        it('should create independent copy', () => {
            const shape = Shape.regularPolygon(4, 10);
            const clone = shape.clone();

            expect(clone.segments.length).toBe(4);

            clone.vertices[0].x = 100;
            expect(shape.vertices[0].x).not.toBe(100);
        });

        it('should preserve ephemeral flag', () => {
            const shape = Shape.regularPolygon(4, 10);
            shape.ephemeral = true;
            const clone = shape.clone();

            expect(clone.ephemeral).toBe(true);
        });
    });

    describe('scale', () => {
        it('should scale shape around centroid', () => {
            const shape = Shape.regularPolygon(4, 10);
            const originalCentroid = shape.centroid().clone();

            shape.scale(2);

            const newCentroid = shape.centroid();
            expect(newCentroid.x).toBeCloseTo(originalCentroid.x, 5);
            expect(newCentroid.y).toBeCloseTo(originalCentroid.y, 5);
        });
    });

    describe('rotate', () => {
        it('should rotate shape around centroid', () => {
            const shape = Shape.regularPolygon(4, 10);
            const originalCentroid = shape.centroid().clone();

            shape.rotate(Math.PI / 4);

            const newCentroid = shape.centroid();
            expect(newCentroid.x).toBeCloseTo(originalCentroid.x, 5);
            expect(newCentroid.y).toBeCloseTo(originalCentroid.y, 5);
        });
    });

    describe('translate', () => {
        it('should move shape by offset', () => {
            const shape = Shape.regularPolygon(4, 10);
            const originalCentroid = shape.centroid().clone();

            shape.translate(new Vector2(50, 100));

            const newCentroid = shape.centroid();
            expect(newCentroid.x).toBeCloseTo(originalCentroid.x + 50, 5);
            expect(newCentroid.y).toBeCloseTo(originalCentroid.y + 100, 5);
        });
    });

    describe('moveTo', () => {
        it('should move centroid to position', () => {
            const shape = Shape.regularPolygon(4, 10);

            shape.moveTo(new Vector2(0, 0));

            const centroid = shape.centroid();
            expect(centroid.x).toBeCloseTo(0, 5);
            expect(centroid.y).toBeCloseTo(0, 5);
        });
    });

    describe('validate', () => {
        it('should return valid for proper shape', () => {
            const shape = Shape.regularPolygon(4, 10);
            const result = shape.validate();

            expect(result.valid).toBe(true);
            expect(result.errors.length).toBe(0);
        });
    });

    describe('toPathData', () => {
        it('should generate valid SVG path data', () => {
            const points = [
                new Vector2(0, 0),
                new Vector2(10, 0),
                new Vector2(10, 10),
            ];
            const shape = Shape.fromPoints(points);
            const path = shape.toPathData();

            expect(path).toContain('M 0 0');
            expect(path).toContain('L 10 0');
            expect(path).toContain('L 10 10');
            expect(path).toContain('Z');
        });
    });
});
