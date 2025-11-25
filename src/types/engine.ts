/**
 * Base interface that all templating engines must implement
 */
export interface BaseEngine {
  /**
   * Unique identifier for the engine
   */
  readonly name: string

  /**
   * File extensions this engine can process
   */
  readonly extensions: string[]

  /**
   * Render a layout template to HTML string
   * @param templatePath - Absolute path to the template file
   * @param context - Optional data to pass to the template
   * @returns Promise resolving to rendered HTML string
   */
  render(templatePath: string, context?: EngineContext): Promise<string>

  /**
   * Check if this engine can handle a given file
   * @param filePath - Path to check
   * @returns true if this engine can process the file
   */
  canHandle(filePath: string): boolean

  /**
   * Initialize the engine (load dependencies, setup, etc.)
   */
  initialize?(): Promise<void>

  /**
   * Cleanup resources when engine is no longer needed
   */
  cleanup?(): Promise<void>
}

/**
 * Context data passed to template engines during rendering
 */
export interface EngineContext {
  /**
   * The component file path that requested this layout
   */
  componentPath?: string

  /**
   * The output HTML file path
   */
  outputPath?: string

  /**
   * Additional user-provided data
   */
  [key: string]: unknown
}

/**
 * Factory function type for creating engine instances
 */
export type EngineFactory = () => BaseEngine | Promise<BaseEngine>

/**
 * Registry entry for an engine
 */
export interface EngineRegistryEntry {
  /**
   * Engine instance or factory
   */
  engine: BaseEngine | EngineFactory

  /**
   * Priority for extension resolution (higher = checked first)
   */
  priority: number
}
