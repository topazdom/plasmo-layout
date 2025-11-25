/**
 * Represents a discovered @layout decorator in a component file
 */
export interface LayoutDeclaration {
  /**
   * The layout path specified in the decorator (e.g., 'tabs.onboarding')
   */
  layoutPath: string

  /**
   * Line number where the decorator was found
   */
  line: number

  /**
   * Column number where the decorator was found
   */
  column: number
}

/**
 * Represents a processed component file with its layout information
 */
export interface ProcessedComponent {
  /**
   * Absolute path to the source component file
   */
  sourcePath: string

  /**
   * Absolute path where the generated HTML should be written
   */
  outputPath: string

  /**
   * Layout declarations found in this component
   */
  layouts: LayoutDeclaration[]

  /**
   * Resolved absolute path to the layout template file
   */
  resolvedLayoutPath?: string

  /**
   * The engine type that will process this layout
   */
  engineType?: string
}

/**
 * Result of processing a single component
 */
export interface ProcessingResult {
  /**
   * The processed component information
   */
  component: ProcessedComponent

  /**
   * Whether processing was successful
   */
  success: boolean

  /**
   * Generated HTML content (if successful)
   */
  html?: string

  /**
   * Error message (if failed)
   */
  error?: string

  /**
   * Time taken to process in milliseconds
   */
  duration: number
}

/**
 * Summary of a build operation
 */
export interface BuildSummary {
  /**
   * Total number of components scanned
   */
  totalScanned: number

  /**
   * Number of components with @layout decorators
   */
  componentsWithLayouts: number

  /**
   * Number of successfully generated HTML files
   */
  successCount: number

  /**
   * Number of failed generations
   */
  failureCount: number

  /**
   * List of processing results
   */
  results: ProcessingResult[]

  /**
   * Total build duration in milliseconds
   */
  duration: number
}

/**
 * Event types emitted during watch mode
 */
export type WatchEventType = 'add' | 'change' | 'unlink'

/**
 * Event emitted during watch mode
 */
export interface WatchEvent {
  /**
   * Type of file system event
   */
  type: WatchEventType

  /**
   * Absolute path to the affected file
   */
  path: string

  /**
   * Whether this is a layout file or component file
   */
  fileType: 'layout' | 'component'
}
