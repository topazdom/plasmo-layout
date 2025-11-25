import { watch as chokidarWatch, type FSWatcher } from 'chokidar'
import { consola } from 'consola'
import type { ResolvedConfig } from '../../types/index.js'
import { processSingleFile } from './build.js'
import { isExcluded, getRelativePath, isGeneratedFile, deleteGeneratedFile } from '../../utils/index.js'
import { hasLayoutDecorator } from '../../utils/parser.js'

/**
 * Watch mode options
 */
export interface WatchOptions {
  /**
   * Called when processing starts for a file
   */
  onProcessStart?: (filePath: string) => void

  /**
   * Called when processing completes for a file
   */
  onProcessComplete?: (filePath: string, success: boolean, error?: string) => void

  /**
   * Called when a file is deleted
   */
  onDelete?: (filePath: string) => void

  /**
   * Called when the watcher is ready
   */
  onReady?: () => void

  /**
   * Called on errors
   */
  onError?: (error: Error) => void
}

/**
 * Watch controller returned by executeWatch
 */
export interface WatchController {
  /**
   * Stop watching
   */
  stop: () => Promise<void>

  /**
   * Get the underlying chokidar watcher
   */
  watcher: FSWatcher
}

/**
 * Execute watch mode - watch for file changes and process incrementally
 * @param config - Resolved configuration
 * @param options - Watch options
 * @returns Watch controller
 */
export async function executeWatch(config: ResolvedConfig, options: WatchOptions = {}): Promise<WatchController> {
  const { onProcessStart, onProcessComplete, onDelete, onReady, onError } = options

  consola.start('Starting watch mode...')
  consola.info(`Watching: ${config.include.join(', ')}`)
  consola.info(`Layouts: ${config.layoutsDir}`)

  // Paths to watch
  const watchPaths = [
    ...config.include.map(pattern => `${config.rootDir}/${pattern.replace(/\*\*\/\*/g, '**/*')}`),
    config.layoutsDirAbsolute,
  ]

  // Create watcher
  const watcher = chokidarWatch(watchPaths, {
    ignored: path => {
      // Ignore excluded patterns
      if (isExcluded(path, config.exclude, config.rootDir)) {
        return true
      }
      // Ignore generated HTML files
      return false
    },
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50,
    },
  })

  // Track files being processed to prevent duplicate processing
  const processing = new Set<string>()

  /**
   * Handle file changes
   */
  async function handleFileChange(filePath: string, eventType: 'add' | 'change'): Promise<void> {
    // Skip if already processing
    if (processing.has(filePath)) {
      return
    }

    // Skip generated files
    if (filePath.endsWith('.html') && (await isGeneratedFile(filePath))) {
      return
    }

    // Check if this is a layout file or component file
    const isLayoutFile = filePath.startsWith(config.layoutsDirAbsolute)

    try {
      processing.add(filePath)
      const relativePath = getRelativePath(filePath, config.rootDir)

      if (isLayoutFile) {
        // Layout file changed - rebuild all components that use it
        consola.info(`Layout changed: ${relativePath}`)
        // For now, log that we detected the change
        // A more sophisticated implementation would track which components use which layouts
        consola.info('Tip: Run full build to update all components using this layout')
      } else {
        // Component file changed
        if (!(await hasLayoutDecorator(filePath))) {
          consola.debug(`No @layout in: ${relativePath}`)
          return
        }

        consola.info(`${eventType === 'add' ? 'New' : 'Changed'}: ${relativePath}`)
        onProcessStart?.(filePath)

        const result = await processSingleFile(filePath, config)

        if (result) {
          if (result.success) {
            consola.success(`Generated: ${getRelativePath(result.component.outputPath, config.rootDir)}`)
            onProcessComplete?.(filePath, true)
          } else {
            consola.error(`Failed: ${result.error}`)
            onProcessComplete?.(filePath, false, result.error)
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      consola.error(`Error processing ${filePath}: ${message}`)
      onError?.(error instanceof Error ? error : new Error(message))
      onProcessComplete?.(filePath, false, message)
    } finally {
      processing.delete(filePath)
    }
  }

  /**
   * Handle file deletion
   */
  async function handleFileUnlink(filePath: string): Promise<void> {
    const relativePath = getRelativePath(filePath, config.rootDir)

    // If it's a component file, check if we should delete its generated HTML
    if (!filePath.startsWith(config.layoutsDirAbsolute)) {
      // Construct the potential HTML output path
      // This is a simplified check - in a real implementation, we'd track the mapping
      const possibleHtml = filePath.replace(/\.(tsx|jsx|ts|js)$/, '.html')

      if (await isGeneratedFile(possibleHtml)) {
        const deleted = await deleteGeneratedFile(possibleHtml)
        if (deleted) {
          consola.info(`Deleted generated HTML for: ${relativePath}`)
          onDelete?.(possibleHtml)
        }
      }
    }

    consola.info(`Removed: ${relativePath}`)
  }

  // Set up event handlers
  watcher
    .on('add', path => handleFileChange(path, 'add'))
    .on('change', path => handleFileChange(path, 'change'))
    .on('unlink', handleFileUnlink)
    .on('ready', () => {
      consola.success('Watch mode ready. Waiting for changes...')
      consola.info('Press Ctrl+C to stop\n')
      onReady?.()
    })
    .on('error', error => {
      consola.error(`Watcher error: ${error.message}`)
      onError?.(error)
    })

  return {
    stop: async () => {
      consola.info('Stopping watch mode...')
      await watcher.close()
      consola.success('Watch mode stopped')
    },
    watcher,
  }
}
