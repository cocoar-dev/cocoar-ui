/**
 * Git Utilities
 * 
 * Common git-related functions for build scripts.
 */

import { access } from 'fs/promises';
import { join, dirname } from 'path';

/**
 * Find git root by looking for .git directory
 * 
 * @param {string} startPath - Path to start searching from
 * @returns {Promise<string>} Absolute path to git root
 * @throws {Error} If git root not found
 */
export async function findGitRoot(startPath) {
  let currentPath = startPath;
  
  while (true) {
    try {
      await access(join(currentPath, '.git'));
      return currentPath;
    } catch {
      const parentPath = dirname(currentPath);
      if (parentPath === currentPath) {
        throw new Error('Git root not found - not in a git repository?');
      }
      currentPath = parentPath;
    }
  }
}
