import { Shape, Vector2 } from '../primitives';
import { ShapesContext } from '../contexts/ShapeContext';
import { LogCabinOptions } from './PatternTypes';

/**
 * Create a traditional Log Cabin quilt block pattern.
 * One of the most iconic and popular quilt blocks, featuring strips (logs) arranged
 * around a center square, traditionally with light and dark sides.
 * Dates back to the 1800s and was especially popular with pioneer women.
 * 
 * @param options - Log Cabin pattern configuration
 * @returns ShapesContext with grouped shapes
 * 
 * @example
 * ```typescript
 * const logCabin = pattern.logCabin({
 *   blockSize: 120,
 *   stripWidth: 15,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export function createLogCabin(options: LogCabinOptions): ShapesContext {
    const { blockSize, stripWidth, bounds } = options;
    const shapes: Shape[] = [];
    
    const numRows = Math.ceil(bounds.height / blockSize);
    const numCols = Math.ceil(bounds.width / blockSize);
    
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const blockX = col * blockSize;
            const blockY = row * blockSize;
            
            // Center square (the "hearth")
            const center = Shape.fromPoints([
                new Vector2(blockX, blockY),
                new Vector2(blockX + stripWidth, blockY),
                new Vector2(blockX + stripWidth, blockY + stripWidth),
                new Vector2(blockX, blockY + stripWidth)
            ]);
            center.group = 'center';
            shapes.push(center);
            
            // Build logs outward from center
            let currentSize = stripWidth;
            let logIndex = 0;
            
            while (currentSize < blockSize) {
                const isLight = logIndex % 2 === 0;
                const group = isLight ? 'light' : 'dark';
                
                // Determine which side to add log to (spiral pattern: right, bottom, left, top)
                const side = logIndex % 4;
                
                if (side === 0) { // Right
                    const log = Shape.fromPoints([
                        new Vector2(blockX + currentSize, blockY),
                        new Vector2(blockX + currentSize + stripWidth, blockY),
                        new Vector2(blockX + currentSize + stripWidth, blockY + currentSize),
                        new Vector2(blockX + currentSize, blockY + currentSize)
                    ]);
                    log.group = group;
                    shapes.push(log);
                } else if (side === 1) { // Bottom
                    const log = Shape.fromPoints([
                        new Vector2(blockX, blockY + currentSize),
                        new Vector2(blockX + currentSize + stripWidth, blockY + currentSize),
                        new Vector2(blockX + currentSize + stripWidth, blockY + currentSize + stripWidth),
                        new Vector2(blockX, blockY + currentSize + stripWidth)
                    ]);
                    log.group = group;
                    shapes.push(log);
                    currentSize += stripWidth;
                } else if (side === 2) { // Left
                    const log = Shape.fromPoints([
                        new Vector2(blockX, blockY),
                        new Vector2(blockX + stripWidth, blockY),
                        new Vector2(blockX + stripWidth, blockY + currentSize),
                        new Vector2(blockX, blockY + currentSize)
                    ]);
                    log.group = group;
                    shapes.push(log);
                } else { // Top (side === 3)
                    const log = Shape.fromPoints([
                        new Vector2(blockX + stripWidth, blockY),
                        new Vector2(blockX + currentSize + stripWidth, blockY),
                        new Vector2(blockX + currentSize + stripWidth, blockY + stripWidth),
                        new Vector2(blockX + stripWidth, blockY + stripWidth)
                    ]);
                    log.group = group;
                    shapes.push(log);
                }
                
                logIndex++;
            }
        }
    }
    
    return new ShapesContext(shapes);
}
