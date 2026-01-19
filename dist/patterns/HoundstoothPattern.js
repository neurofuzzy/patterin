import { Shape, Vector2 } from '../primitives';
import { ShapesContext } from '../contexts/ShapeContext';
/**
 * Create a houndstooth pattern.
 * Generates the classic jagged check pattern with distinctive tooth shapes.
 *
 * @param options - Houndstooth pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const houndstooth = createHoundstooth({
 *   size: 40,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export function createHoundstooth(options) {
    const { size, bounds } = options;
    const shapes = [];
    // Houndstooth is a 2x2 repeating unit
    const unitSize = size * 2;
    const cols = Math.ceil(bounds.width / unitSize);
    const rows = Math.ceil(bounds.height / unitSize);
    // Helper function to create a tooth shape
    // The tooth has a jagged diagonal edge characteristic of houndstooth
    const createTooth = (x, y, size, rotated) => {
        if (!rotated) {
            // Upper-left tooth (dark on light background)
            const points = [
                new Vector2(x, y), // Top-left
                new Vector2(x + size, y), // Top-right
                new Vector2(x + size, y + size / 2), // Mid-right
                new Vector2(x + size / 2, y + size / 2), // Mid-center
                new Vector2(x + size / 2, y + size), // Mid-bottom
                new Vector2(x, y + size) // Bottom-left
            ];
            return Shape.fromPoints(points);
        }
        else {
            // Lower-right tooth (opposite orientation)
            const points = [
                new Vector2(x + size / 2, y), // Top-center
                new Vector2(x + size, y), // Top-right
                new Vector2(x + size, y + size), // Bottom-right
                new Vector2(x, y + size), // Bottom-left
                new Vector2(x, y + size / 2), // Mid-left
                new Vector2(x + size / 2, y + size / 2) // Mid-center
            ];
            return Shape.fromPoints(points);
        }
    };
    // Generate the houndstooth pattern
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const baseX = col * unitSize;
            const baseY = row * unitSize;
            // Each 2x2 unit has 4 teeth in specific arrangement
            // Top-left tooth
            const tooth1 = createTooth(baseX, baseY, size, false);
            tooth1.group = 'dark';
            shapes.push(tooth1);
            // Top-right tooth (complementary)
            const tooth2 = createTooth(baseX + size, baseY, size, true);
            tooth2.group = 'light';
            shapes.push(tooth2);
            // Bottom-left tooth (complementary)
            const tooth3 = createTooth(baseX, baseY + size, size, true);
            tooth3.group = 'light';
            shapes.push(tooth3);
            // Bottom-right tooth
            const tooth4 = createTooth(baseX + size, baseY + size, size, false);
            tooth4.group = 'dark';
            shapes.push(tooth4);
        }
    }
    return new ShapesContext(shapes);
}
