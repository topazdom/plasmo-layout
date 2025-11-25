import { consola } from 'consola';
import type { ResolvedConfig } from '../../types/index.js';
import { findGeneratedFiles, deleteGeneratedFile, getRelativePath } from '../../utils/index.js';

/**
 * Result of the clean operation
 */
export interface CleanResult {
  /**
   * Number of files found
   */
  filesFound: number;

  /**
   * Number of files deleted
   */
  filesDeleted: number;

  /**
   * List of deleted file paths
   */
  deletedFiles: string[];

  /**
   * Duration in milliseconds
   */
  duration: number;
}

/**
 * Execute the clean command - remove all generated HTML files
 * @param config - Resolved configuration
 * @param dryRun - If true, only show what would be deleted without actually deleting
 * @returns Clean result
 */
export async function executeClean(
  config: ResolvedConfig,
  dryRun = false
): Promise<CleanResult> {
  const startTime = Date.now();
  const deletedFiles: string[] = [];

  consola.start(dryRun ? 'Finding generated files (dry run)...' : 'Cleaning generated files...');

  // Find all generated files
  const generatedFiles = await findGeneratedFiles(config);
  consola.info(`Found ${generatedFiles.length} generated files`);

  if (generatedFiles.length === 0) {
    consola.success('No generated files to clean');
    return {
      filesFound: 0,
      filesDeleted: 0,
      deletedFiles: [],
      duration: Date.now() - startTime,
    };
  }

  // Delete each file
  for (const filePath of generatedFiles) {
    const relativePath = getRelativePath(filePath, config.rootDir);

    if (dryRun) {
      consola.info(`Would delete: ${relativePath}`);
      deletedFiles.push(filePath);
    } else {
      const deleted = await deleteGeneratedFile(filePath);
      if (deleted) {
        consola.success(`Deleted: ${relativePath}`);
        deletedFiles.push(filePath);
      } else {
        consola.warn(`Skipped (not generated): ${relativePath}`);
      }
    }
  }

  const duration = Date.now() - startTime;

  consola.info('');
  consola.box(
    `${dryRun ? 'Clean Preview' : 'Clean Complete'}\n\n` +
      `Files found: ${generatedFiles.length}\n` +
      `Files ${dryRun ? 'to delete' : 'deleted'}: ${deletedFiles.length}\n` +
      `Duration: ${duration}ms`
  );

  return {
    filesFound: generatedFiles.length,
    filesDeleted: deletedFiles.length,
    deletedFiles,
    duration,
  };
}
