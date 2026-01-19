import { describe, it, expect } from 'vitest';
import {
    system,
    shape,
    SVGCollector,
    Vector2
} from '../../src/index.ts';

describe('System Masking', () => {
    it('should mask a grid with a circle', () => {
        // Create a 10x10 grid with 10 spacing (100x100 area centered at 0,0?)
        // Default grid is centered at 0,0 if offset is 0,0? 
        // Let's check GridSystem defaults.
        // If count=10, size=10.
        // 10 cols * 10 size = 100 width. 
        // We need to ensure the grid covers the mask.

        // Create a large grid
        const grid = system.grid({
            count: 20,
            size: 10,
            // Center the grid around origin to match circle default center
            offset: [-100, -100] // Shift top-left to -100,-100 so center is near 0,0
            // Actually GridSystem builds starting at 0,0 usually unless offset is specified.
            // Let's verify grid centering or just use a mask that covers the grid area.
        });

        // Let's inspect the grid bounds or node positions to be sure.
        // Grid nodes start at (0,0) + offset.
        // If we want a circle at the center of the grid:
        // Grid width = 20 * 10 = 200. Center is at 100, 100.

        const maskCircle = shape.circle().radius(50).moveTo(new Vector2(0, 0));

        // Place squares at every node
        grid.place(shape.square().size(5));

        // Count placements before masking
        // We can't easily access internal placements count from public API without 'stamp' or casting to any
        // But we can check behavior by stamping to collector.

        let collector = new SVGCollector();
        grid.stamp(collector);
        const countBefore = collector.length;
        expect(countBefore).toBe(441); // 20x20 grid has 21x21 = 441 nodes

        // Apply mask
        grid.mask(maskCircle);

        // Stamp again
        collector = new SVGCollector();
        grid.stamp(collector);
        const countAfter = collector.length;

        // Verify count reduced
        expect(countAfter).toBeLessThan(countBefore);
        expect(countAfter).toBeGreaterThan(0);

        // Only items inside circle should remain. 
        // Area of grid ~ 200x200 = 40000. 400 nodes. Density = 400/40000 = 0.01 nodes/unit^2
        // Area of circle = PI * 50^2 = 7854.
        // Expected nodes ~ 7854 * 0.01 = 78.5 nodes.
        // Let's conservatively expect between 60 and 100.
        expect(countAfter).toBeGreaterThan(60);
        expect(countAfter).toBeLessThan(100);

        // Verify mask is ephemeral (not stamped)
        // The stamp count includes placements.
        // If mask was stamped, it would add 1.
        // But placements are individual shapes.
        // Let's verify implicitly by the count logic or explicit check if we could.
    });

    it('should mark mask as ephemeral', () => {
        const grid = system.grid({ count: 5, size: 10 });
        const maskShape = shape.circle().radius(20);

        expect(maskShape.shape.ephemeral).toBe(false);
        grid.mask(maskShape);
        expect(maskShape.shape.ephemeral).toBe(true);
    });
});
