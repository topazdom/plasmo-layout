/**
 * plasmo-layout - Automate HTML layout generation for Plasmo browser extension components
 *
 * This module exports the public API for programmatic usage.
 * For CLI usage, run: plasmo-layout --help
 */

// Type exports
export type {
  PlasmoLayoutConfig,
  ResolvedConfig,
  EngineType,
  CustomEngine,
  CustomEngineConfig,
  LayoutDeclaration,
  ProcessedComponent,
  ProcessingResult,
  BuildSummary,
  WatchEvent,
  WatchEventType,
  BaseEngine,
  EngineContext,
} from './types/index.js'

// Configuration exports
export { loadConfig, createDefaultConfig, validateConfig, DEFAULT_CONFIG } from './config/index.js'

// Utils exports
export {
  getMatchingFiles,
  getOutputHtmlPath,
  resolveLayoutPath,
  writeGeneratedHtml,
  findGeneratedFiles,
  deleteGeneratedFile,
  isGeneratedFile,
  GENERATED_HEADER,
} from './utils/index.js'

// Parser exports
export {
  parseLayoutDecorators,
  hasLayoutDecorator,
  processComponentFile,
  processComponentFiles,
} from './utils/parser.js'

// Engine exports
export {
  createEngineRegistry,
  getEngineForFile,
  AbstractEngine,
  createJsxEngine,
  createEdgeEngine,
  wrapInHtmlDocument,
  ensureHtmlDocument,
} from './engines/index.js'

// Command exports (for programmatic usage)
export { executeBuild, processSingleFile } from './cli/commands/build.js'
export { executeClean, type CleanResult } from './cli/commands/clean.js'
export { executeWatch, type WatchOptions, type WatchController } from './cli/commands/watch.js'
