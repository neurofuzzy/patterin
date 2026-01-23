
import { Shape } from '../primitives/Shape';
import { Segment } from '../primitives/Segment';
import { Vector2 } from '../primitives/Vector2';

/**
 * Boolean operations for Shapes (Union, etc.)
 * Uses a "Shatter and Filter" approach:
 * 1. Find intersections and split segments (Shatter)
 * 2. Filter segments based on inclusion (Filter)
 * 3. Reconstruct closed loops (Stitch)
 */
export class BooleanOps {
    /**
     * Compute the union of multiple shapes.
     * @param shapes List of shapes to merge
     * @returns Array of resulting shapes (can be disjoint)
     */
    static union(shapes: Shape[]): Shape[] {
        if (shapes.length === 0) return [];
        if (shapes.length === 1) return [shapes[0].clone()];

        // Clone inputs to avoid mutating originals (e.g. winding reversal)
        const workingShapes = shapes.map(s => s.clone());
        return BooleanOps.globalUnion(workingShapes);
    }

    /**
     * Compute union of all input shapes using global shatter/filter.
     */
    static globalUnion(shapes: Shape[]): Shape[] {
        // 2. Shatter: Intersect every segment with every other segment
        const finalSegments = BooleanOps.shatter(shapes);

        // 3. Filter: Remove segments that are inside ANY OTHER shape
        const keptSegments: SegmentWithPath[] = [];

        for (const seg of finalSegments) {
            const mid = seg.start.lerp(seg.end, 0.5);
            let isInsideAny = false;

            for (const shape of shapes) {
                if (shape === seg.originalShape) continue;

                // Check strict containment first
                if (shape.containsPoint(mid, 1e-4)) {
                    // Check if it's on the boundary (coincident edges)
                    if (BooleanOps.isOnBoundary(shape, mid)) {
                        // Tie-breaker: If overlapping, discard if other shape has lower index
                        // (Arbitrary rule to keep one copy)
                        const myIndex = shapes.indexOf(seg.originalShape);
                        const otherIndex = shapes.indexOf(shape);
                        if (otherIndex < myIndex) {
                            isInsideAny = true;
                            break;
                        }
                        // Else keep it (treat as outside)
                    } else {
                        // Strictly inside -> discard
                        isInsideAny = true;
                        break;
                    }
                }
            }

            if (!isInsideAny) {
                keptSegments.push(seg);
            }
        }

        // 4. Stitch
        return BooleanOps.stitchSegments(keptSegments);
    }

    /**
     * Compute the difference of shapes (subjects - clips).
     * @param subjects List of shapes to be cut (positive)
     * @param clips List of shapes to cut with (negative)
     * @returns Array of resulting shapes
     */
    static difference(subjects: Shape[], clips: Shape[]): Shape[] {
        if (subjects.length === 0) return [];
        if (clips.length === 0) return subjects.map(s => s.clone());

        // Clone inputs
        const workingSubjects = subjects.map(s => s.clone());
        const workingClips = clips.map(s => s.clone());
        const allShapes = [...workingSubjects, ...workingClips];

        // Ensure CCW winding
        for (const s of allShapes) {
            if (s.winding === 'cw') s.reverse();
        }

        // 1. Shatter all shapes against each other
        const shattered = BooleanOps.shatter(allShapes);

        // 2. Filter
        const keptSegments: SegmentWithPath[] = [];

        for (const seg of shattered) {
            const isSubject = workingSubjects.includes(seg.originalShape);
            const mid = seg.start.lerp(seg.end, 0.5);

            if (isSubject) {
                // SUBJECT seg: Keep if OUTSIDE all clips
                // AND not inside other subjects (to handle union of subjects if they overlap?)
                // Standard boolean difference (A U B) - C
                // Actually usually Union(Subjects) - Union(Clips).
                // Let's assume input is a set of subjects and set of clips.
                // For Subject edge:
                // - Must be outside ALL Clips.
                // - Ideally should be outside other Subjects (to merge subjects)? 
                //   If we want "Union of Subjects minus Union of Clips":
                //   - Keep if outside all Clips AND outside all OTHER Subjects (standard Union rule).
                // Let's stick to "Union(Subjects) - Union(Clips)" semantics.

                let insideClip = false;
                for (const clip of workingClips) {
                    if (clip.containsPoint(mid, 1e-4)) {
                        // If on boundary of clip, we treat it as inside (to remove it)
                        // A - A = Empty. Edge of A is on boundary of A.
                        // Ideally we remove it.
                        // But wait, if we remove it, we open the shape.
                        // If we keep it, we keep the edge.
                        // Let's be aggressive: if on boundary of proper clip, remove it.
                        insideClip = true;
                        break;
                    }
                }

                if (insideClip) continue;

                // Also check other subjects for self-union
                let insideOtherSubject = false;
                for (const other of workingSubjects) {
                    if (other === seg.originalShape) continue;
                    if (other.containsPoint(mid, 1e-4)) {
                        if (BooleanOps.isOnBoundary(other, mid)) {
                            // Union tie-breaker
                            const myIndex = workingSubjects.indexOf(seg.originalShape);
                            const otherIndex = workingSubjects.indexOf(other);
                            if (otherIndex < myIndex) {
                                insideOtherSubject = true;
                                break;
                            }
                        } else {
                            insideOtherSubject = true;
                            break;
                        }
                    }
                }

                if (!insideOtherSubject) {
                    keptSegments.push(seg);
                }

            } else {
                // CLIP seg: Keep if INSIDE Union(Subjects)
                // And NOT inside other Clips (Union of clips logic for holes?)
                // Actually, for the "hole" boundary, we want the boundary of Union(Clips) that is inside Union(Subjects).

                // 1. Must be INSIDE at least one Subject.
                let insideSubject = false;
                for (const sub of workingSubjects) {
                    if (sub.containsPoint(mid, 1e-4)) {
                        // On boundary of subject?
                        // If Clip edge is on Subject edge.
                        // A - A. Clip edge (A) on Subject edge (A).
                        // Should we keep it? 
                        // If we keeping it, we reverse it.
                        // A - A = Empty.
                        // If we keep reversed A edge. We have reversed A string.
                        // If we discard Subject edge (as defined above).
                        // Result is reversed A.
                        // As discussed, this means negative space.
                        // Ideally we discard it.

                        if (BooleanOps.isOnBoundary(sub, mid)) {
                            // Coincident boundary.
                            // If we remove subject edge, we should probably remove clip edge too?
                            // Or keep clip edge?
                            // Standard intersection: keep coincident.
                            // Difference: remove coincident?
                            // Let's try Strict Inside for Clips.
                        } else {
                            insideSubject = true;
                            break;
                        }
                    }
                }

                if (!insideSubject) continue;

                // 2. Must be OUTSIDE all other Clips (Union of Clip boundaries)
                let insideOtherClip = false;
                for (const other of workingClips) {
                    if (other === seg.originalShape) continue;
                    if (other.containsPoint(mid, 1e-4)) {
                        if (BooleanOps.isOnBoundary(other, mid)) {
                            // Union tie-breaker for clips
                            const myIndex = workingClips.indexOf(seg.originalShape);
                            const otherIndex = workingClips.indexOf(other);
                            if (otherIndex < myIndex) {
                                insideOtherClip = true;
                                break;
                            }
                        } else {
                            insideOtherClip = true;
                            break;
                        }
                    }
                }

                if (insideOtherClip) continue;

                // If kept, REVERSE it to form hole
                keptSegments.push({
                    start: seg.end,
                    end: seg.start,
                    originalShape: seg.originalShape
                });
            }
        }

        return BooleanOps.stitchSegments(keptSegments);
    }

    /**
     * Shatter operation: Intersect all segments with each other and split them.
     */
    private static shatter(shapes: Shape[]): SegmentWithPath[] {
        // Collect all segments
        let allSegments: SegmentWithPath[] = [];
        for (const shape of shapes) {
            for (const seg of shape.segments) {
                allSegments.push({
                    start: seg.start.position,
                    end: seg.end.position,
                    originalShape: shape
                });
            }
        }

        const splits = new Map<number, { t: number, pt: Vector2 }[]>();

        // Find intersections
        for (let i = 0; i < allSegments.length; i++) {
            for (let j = i + 1; j < allSegments.length; j++) {
                const s1 = allSegments[i];
                const s2 = allSegments[j];
                // Don't intersect segments from same shape (assume simple polygons)
                if (s1.originalShape === s2.originalShape) continue;

                const intersection = BooleanOps.intersectSegments(s1.start, s1.end, s2.start, s2.end);
                if (intersection) {
                    if (intersection.t1 > 1e-5 && intersection.t1 < 1 - 1e-5) {
                        if (!splits.has(i)) splits.set(i, []);
                        splits.get(i)!.push({ t: intersection.t1, pt: intersection.point });
                    }
                    if (intersection.t2 > 1e-5 && intersection.t2 < 1 - 1e-5) {
                        if (!splits.has(j)) splits.set(j, []);
                        splits.get(j)!.push({ t: intersection.t2, pt: intersection.point });
                    }
                }
            }
        }

        // Apply splits
        const finalSegments: SegmentWithPath[] = [];
        for (let i = 0; i < allSegments.length; i++) {
            if (splits.has(i)) {
                const points = splits.get(i)!.sort((a, b) => a.t - b.t);
                let curr = allSegments[i].start;
                for (const split of points) {
                    if (curr.distanceTo(split.pt) > 1e-5) {
                        finalSegments.push({
                            start: curr,
                            end: split.pt,
                            originalShape: allSegments[i].originalShape
                        });
                    }
                    curr = split.pt;
                }
                if (curr.distanceTo(allSegments[i].end) > 1e-5) {
                    finalSegments.push({
                        start: curr,
                        end: allSegments[i].end,
                        originalShape: allSegments[i].originalShape
                    });
                }
            } else {
                finalSegments.push(allSegments[i]);
            }
        }

        return finalSegments;
    }

    private static isOnBoundary(shape: Shape, point: Vector2, epsilon = 1e-4): boolean {
        for (const seg of shape.segments) {
            if (seg.distanceToPoint(point) < epsilon) return true;
        }
        return false;
    }

    // --- Helpers ---

    private static intersectSegments(
        p1: Vector2, p2: Vector2,
        p3: Vector2, p4: Vector2
    ): { point: Vector2, t1: number, t2: number } | null {
        const d1 = p2.subtract(p1);
        const d2 = p4.subtract(p3);
        const cross = d1.cross(d2);

        if (Math.abs(cross) < 1e-8) return null; // Parallel

        const d3 = p3.subtract(p1);
        const t1 = d3.cross(d2) / cross;
        const t2 = d3.cross(d1) / cross;

        if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
            return {
                point: p1.add(d1.multiply(t1)),
                t1,
                t2
            };
        }
        return null;
    }

    private static stitchSegments(segments: SegmentWithPath[]): Shape[] {
        if (segments.length === 0) return [];

        const result: Shape[] = [];
        const pool = new Set(segments);

        // Build adjacency map for fast lookup: StartPoint (string key) -> Segment[]
        const startMap = new Map<string, SegmentWithPath[]>();
        const key = (v: Vector2) => `${v.x.toFixed(4)},${v.y.toFixed(4)}`;

        for (const seg of segments) {
            const k = key(seg.start);
            if (!startMap.has(k)) startMap.set(k, []);
            startMap.get(k)!.push(seg);
        }

        while (pool.size > 0) {
            // Pick random start
            const first = pool.values().next().value as SegmentWithPath;
            pool.delete(first);

            const shapePoints: Vector2[] = [first.start];
            let curr = first;
            let closed = false;

            // Walk max N steps to prevent infinite loop
            for (let i = 0; i < segments.length * 2; i++) {
                const nextKey = key(curr.end);
                const candidates = startMap.get(nextKey);

                let nextSeg: SegmentWithPath | undefined;

                if (candidates) {
                    const validCandidates = candidates.filter(c => pool.has(c));
                    if (validCandidates.length === 0) break; // Dead end

                    if (validCandidates.length === 1) {
                        nextSeg = validCandidates[0];
                    } else {
                        // Choose based on direction to maximize left turn (CCW follower)
                        const currDir = curr.end.subtract(curr.start);
                        // We want the vector that turns "least right" (most left)
                        // i.e., largest signed angle

                        let bestIdx = -1;
                        let maxAngle = -Infinity;

                        for (let j = 0; j < validCandidates.length; j++) {
                            const c = validCandidates[j];
                            const nextDir = c.end.subtract(c.start);
                            // Angle of nextDir relative to currDir 
                            // cross product z gives sin(theta). dot gives cos(theta).
                            // atan2(cross, dot) gives angle in -PI, PI range.

                            const angle = Math.atan2(currDir.cross(nextDir), currDir.dot(nextDir));
                            // We want largest positive angle (left turn). 
                            // But actually we are following a perimeter, so we just want the "leftmost" branch.
                            // If we come in, we want to turn left as much as possible to stay on the outside?
                            // No, for union of CCW shapes, the boundary is CCW.
                            // At a junction, we want to turn "right" relative to the intersection to stay outside?
                            // Wait: A U B. Outside segments.
                            // Moving along A, hit B. We should switch to B's outside edge.
                            // The "outside" edge is typically the rightmost if we are walking CCW?
                            // Let's defer complexity: standard sorting by angle usually works.

                            if (angle > maxAngle) {
                                maxAngle = angle;
                                bestIdx = j;
                            }
                        }

                        // Fallback
                        nextSeg = validCandidates[bestIdx !== -1 ? bestIdx : 0];
                    }
                }

                if (!nextSeg) break;

                pool.delete(nextSeg);
                shapePoints.push(nextSeg.start);

                // Check closure
                if (nextSeg.end.distanceTo(shapePoints[0]) < 1e-4) {
                    closed = true;
                    break;
                }

                curr = nextSeg;
            }

            if (closed && shapePoints.length >= 3) {
                const shape = Shape.fromPoints(shapePoints);

                // Propagate color from the original shape of the first segment
                if (first.originalShape && first.originalShape.color) {
                    shape.color = first.originalShape.color;
                }

                // Detect actual winding
                if (shape.area() < 0) {
                    shape.winding = 'cw';
                    // Re-sync segments with new winding
                    shape.connectSegments();
                }
                result.push(shape);
            }
        }

        return result;
    }
}

interface SegmentWithPath {
    start: Vector2;
    end: Vector2;
    originalShape: Shape;
}
