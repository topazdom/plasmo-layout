/**
 * Supported templating engines for layout rendering
 */
export type EngineType = 'jsx' | 'edge' | 'custom'

/**
 * Interface for custom templating engines
 * Users implementing custom engines must follow this interface
 */
export interface CustomEngine {
  /**
   * Unique name identifier for the engine
   */
  name: string

  /**
   * File extensions this engine handles (e.g., ['.custom', '.tpl'])
   */
  extensions: string[]

  /**
   * Render a layout template to HTML
   * @param templatePath - Absolute path to the template file
   * @param context - Optional context data to pass to the template
   * @returns Promise resolving to rendered HTML string
   */
  render(templatePath: string, context?: Record<string, unknown>): Promise<string>

  /**
   * Optional initialization hook called when the engine is loaded
   */
  initialize?(): Promise<void>

  /**
   * Optional cleanup hook called when the engine is unloaded
   */
  cleanup?(): Promise<void>
}

/**
 * Configuration for a custom engine loaded from user's project
 */
export interface CustomEngineConfig {
  /**
   * Path to the custom engine module (relative to project root or absolute)
   */
  path: string

  /**
   * Optional configuration passed to the engine
   */
  options?: Record<string, unknown>
}

/**
 * Main configuration interface for plasmo-layout
 */
export interface PlasmoLayoutConfig {
  /**
   * Glob patterns for files to include in component scanning
   * @default ['src/**\/*.{tsx,jsx}']
   */
  include?: string[]

  /**
   * Glob patterns for files/directories to exclude from scanning
   * @default ['**\/node_modules/**', '**\/.git/**', '**\/dist/**', '**\/build/**']
   */
  exclude?: string[]

  /**
   * Directory containing layout templates (relative to project root)
   * @default 'layouts'
   */
  layoutsDir?: string

  /**
   * Primary templating engine to use
   * @default 'jsx'
   */
  engine?: EngineType

  /**
   * Custom engine configuration (required when engine is 'custom')
   */
  customEngine?: CustomEngineConfig

  /**
   * Extension fallback chain for resolving layout files
   * Engine-specific extensions are checked in order
   * @default { jsx: ['.tsx', '.jsx'], edge: ['.edge'], custom: [] }
   */
  extensionFallback?: Record<EngineType, string[]>

  /**
   * Output directory for generated HTML files
   * If not specified, HTML files are generated next to components (Plasmo convention)
   * @default undefined (generates next to components)
   */
  outputDir?: string

  /**
   * Enable verbose logging
   * @default false
   */
  verbose?: boolean
}

/**
 * Resolved configuration with all defaults applied
 */
export interface ResolvedConfig extends Required<Omit<PlasmoLayoutConfig, 'customEngine' | 'outputDir'>> {
  /**
   * Custom engine configuration (undefined if not using custom engine)
   */
  customEngine?: CustomEngineConfig

  /**
   * Output directory (undefined means generate next to components)
   */
  outputDir?: string

  /**
   * Absolute path to the project root
   */
  rootDir: string

  /**
   * Absolute path to the layouts directory
   */
  layoutsDirAbsolute: string
}
