import { ShapesContext } from '../contexts/ShapeContext';
import { FriendshipStarOptions } from './PatternTypes';
/**
 * Create a traditional Friendship Star quilt block pattern.
 * A nine-patch variation featuring a center square, four corner squares,
 * and four half-square triangle units forming star points.
 * One of the most beloved traditional quilt blocks.
 *
 * @param options - Friendship Star pattern configuration
 * @returns ShapesContext with grouped shapes
 *
 * @example
 * ```typescript
 * const friendshipStar = pattern.friendshipStar({
 *   blockSize: 90,
 *   bounds: { width: 400, height: 400 }
 * });
 * ```
 */
export declare function createFriendshipStar(options: FriendshipStarOptions): ShapesContext;
