/**
 * Test for Clone System with subset offset operations
 * Verifies that offsetting a subset doesn't remove the original system shapes
 */

import { describe, it, expect } from 'vitest';
import { RectContext } from '../../src/contexts/ShapeContext';
import { SVGCollector } from '../../src/collectors/SVGCollector';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

describe('CloneSystem - Subset Offset', () => {
    it('should render both original system shapes and offset subset', () => {
        const svg = new SVGCollector();
        
        // Create a grid and keep reference to the system
        const system = new RectContext()
            .clone(10, 40, 0)
            .clone(10, 0, 40);
        
        // Select every other one, transform and offset
        const offsetResult = system.every(2).scale(3).rotate(45).offset(5, 1);
        
        // Stamp the system (should render all original shapes)
        system.stamp(svg);
        
        // Stamp the offset results
        offsetResult.stamp(svg);
        
        // Generate SVG
        const output = svg.toString({
            width: 400,
            height: 400,
            margin: 20,
            autoScale: false
        });
        
        // Write to file for visual inspection
        const outPath = resolve(__dirname, '../../test-output/clone-offset-subset.svg');
        writeFileSync(outPath, output);
        
        // Verify we have content
        expect(output).toContain('<path');
        
        // Count path elements (not group tags)
        const pathCount = (output.match(/<path /g) || []).length;
        
        // With new default (no originals in offset result):
        // clone(10, ...) creates 11 shapes (original + 10 copies)
        // clone(10, ...) on those 11 creates: 11 × 11 = 121 shapes total
        // every(2): selects 61 shapes (checkerboard pattern from 121)
        // offset(5, 1): creates 61 offset copies only (no originals)
        // Total: 121 (system with transformed shapes) + 61 (offset copies) = 182
        expect(pathCount).toBe(182);
    });

    it('should render original grid when subset is transformed WITHOUT offset', () => {
        const svg = new SVGCollector();
        
        // Create a grid, select every other one, transform (NO offset)
        const system = new RectContext()
            .clone(10, 40, 0)
            .clone(10, 0, 40);
        
        // Apply transformations to subset but don't offset
        system.every(2).scale(3).rotate(45);
        
        // Stamp the system
        system.stamp(svg);
        
        const output = svg.toString({
            width: 400,
            height: 400,
            margin: 20,
            autoScale: false
        });
        
        // Write to file
        const outPath = resolve(__dirname, '../../test-output/clone-subset-transform.svg');
        writeFileSync(outPath, output);
        
        // Should have all shapes in the system:
        // clone(10, ...) creates 11 × 11 = 121 shapes
        // every(2) modifies 61 shapes in-place (scaled and rotated into diamonds)
        // Unmodified: 60 small squares
        // Modified: 61 large diamonds
        // Total: 121 shapes
        const pathCount = (output.match(/<path /g) || []).length;
        expect(pathCount).toBe(121);
    });

    it('should render ALL grid shapes plus offset subset copies', () => {
        const svg = new SVGCollector();
        
        // Simpler test: 3x3 grid for easier counting
        const system = new RectContext()
            .clone(3, 40, 0)
            .clone(3, 0, 40);
        
        // Select every other (checkerboard), offset
        const subset = system.every(2).offset(3, 1);
        
        // Stamp system first
        system.stamp(svg);
        
        // Stamp offset results
        subset.stamp(svg);
        
        const output = svg.toString({
            width: 400,
            height: 400,
            margin: 20,
            autoScale: false
        });
        
        // Write to file
        const outPath = resolve(__dirname, '../../test-output/clone-offset-3x3.svg');
        writeFileSync(outPath, output);
        
        const pathCount = (output.match(/<path /g) || []).length;
        
        // clone(3,...) creates 4 shapes per dimension (original + 3 copies)
        // 4 × 4 = 16 shapes total
        // every(2) = 8 shapes (checkerboard pattern)
        // offset(3, 1) on those 8 = 8 offset copies only (no originals)
        // Total: 16 (original grid) + 8 (offset copies) = 24
        expect(pathCount).toBe(24);
    });
});
