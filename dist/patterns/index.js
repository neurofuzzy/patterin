/**
 * Quilt Block Templates
 *
 * This module exports quilt block templates. For creating quilts, use system.quilt().
 *
 * @example
 * ```typescript
 * import { system } from 'patterin';
 *
 * const quilt = system.quilt({ gridSize: [4, 4], blockSize: 100 });
 * quilt.every(2).placeBlock('BD');      // BrokenDishes on even positions
 * quilt.every(2, 1).placeBlock('FS');   // FriendshipStar on odd positions
 * quilt.stamp(svg);
 * ```
 */
export { quiltBlockTemplates } from './QuiltPattern';
