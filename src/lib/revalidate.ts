'use server';

import { revalidatePath } from 'next/cache';

/**
 * Revalidates the cache for a specific path.
 * This function should be called after any data mutation (e.g., creating, updating, or deleting content)
 * to ensure that the changes are reflected on the live site.
 *
 * @param path The path to revalidate (e.g., '/', '/posts', '/post/[id]')
 */
export async function revalidate(path: string) {
    try {
        revalidatePath(path, 'page');
    } catch (error) {
        console.error(`Error revalidating path ${path}:`, error);
    }
}
