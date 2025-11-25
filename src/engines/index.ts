import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { consola } from 'consola';
import type { BaseEngine, EngineContext, CustomEngine, ResolvedConfig } from '../types/index.js';
import { AbstractEngine } from './base.js';
import { createJsxEngine } from './jsx.js';
import { createEdgeEngine } from './edge.js';

/**
 * Engine registry to manage available engines
 */
class EngineRegistry {
  private engines: Map<string, BaseEngine> = new Map();
  private initialized = false;

  /**
   * Register a built-in engine
   */
  register(engine: BaseEngine): void {
    this.engines.set(engine.name, engine);
  }

  /**
   * Get an engine by name
   */
  get(name: string): BaseEngine | undefined {
    return this.engines.get(name);
  }

  /**
   * Get all registered engines
   */
  getAll(): BaseEngine[] {
    return Array.from(this.engines.values());
  }

  /**
   * Check if an engine is registered
   */
  has(name: string): boolean {
    return this.engines.has(name);
  }

  /**
   * Initialize all registered engines
   */
  async initializeAll(): Promise<void> {
    if (this.initialized) return;

    for (const engine of this.engines.values()) {
      if (engine.initialize) {
        try {
          await engine.initialize();
        } catch (error) {
          consola.warn(`Failed to initialize engine "${engine.name}": ${error}`);
        }
      }
    }
    this.initialized = true;
  }

  /**
   * Cleanup all registered engines
   */
  async cleanupAll(): Promise<void> {
    for (const engine of this.engines.values()) {
      if (engine.cleanup) {
        try {
          await engine.cleanup();
        } catch (error) {
          consola.warn(`Failed to cleanup engine "${engine.name}": ${error}`);
        }
      }
    }
    this.initialized = false;
  }

  /**
   * Find an engine that can handle a file
   */
  findForFile(filePath: string): BaseEngine | undefined {
    for (const engine of this.engines.values()) {
      if (engine.canHandle(filePath)) {
        return engine;
      }
    }
    return undefined;
  }
}

/**
 * Custom engine wrapper that adapts user-provided engines to BaseEngine interface
 */
class CustomEngineWrapper extends AbstractEngine {
  readonly name: string;
  readonly extensions: string[];
  private customEngine: CustomEngine;

  constructor(customEngine: CustomEngine) {
    super();
    this.customEngine = customEngine;
    this.name = customEngine.name;
    this.extensions = customEngine.extensions;
  }

  async render(templatePath: string, context?: EngineContext): Promise<string> {
    return this.customEngine.render(templatePath, context);
  }

  async initialize(): Promise<void> {
    if (this.customEngine.initialize) {
      await this.customEngine.initialize();
    }
  }

  async cleanup(): Promise<void> {
    if (this.customEngine.cleanup) {
      await this.customEngine.cleanup();
    }
  }
}

/**
 * Load a custom engine from a file path
 * @param enginePath - Path to the custom engine module
 * @param rootDir - Project root directory
 */
async function loadCustomEngine(enginePath: string, rootDir: string): Promise<CustomEngine> {
  const absolutePath = resolve(rootDir, enginePath);
  const fileUrl = pathToFileURL(absolutePath).href;

  try {
    const module = await import(fileUrl);
    const engine: CustomEngine = module.default || module;

    // Validate engine interface
    if (!engine.name || !engine.extensions || !engine.render) {
      throw new Error(
        'Custom engine must implement the CustomEngine interface with name, extensions, and render'
      );
    }

    return engine;
  } catch (error) {
    throw new Error(
      `Failed to load custom engine from "${enginePath}": ${
        error instanceof Error ? error.message : error
      }`
    );
  }
}

/**
 * Create and configure the engine registry based on config
 * @param config - Resolved configuration
 */
export async function createEngineRegistry(config: ResolvedConfig): Promise<EngineRegistry> {
  const registry = new EngineRegistry();

  // Register built-in engines
  registry.register(createJsxEngine());
  registry.register(createEdgeEngine());

  // Load and register custom engine if configured
  if (config.engine === 'custom' && config.customEngine) {
    consola.debug(`Loading custom engine from: ${config.customEngine.path}`);
    const customEngine = await loadCustomEngine(config.customEngine.path, config.rootDir);
    registry.register(new CustomEngineWrapper(customEngine));
  }

  return registry;
}

/**
 * Get the appropriate engine for a given file
 * @param registry - Engine registry
 * @param filePath - File path
 * @param preferredEngine - Preferred engine name
 */
export function getEngineForFile(
  registry: EngineRegistry,
  filePath: string,
  preferredEngine?: string
): BaseEngine | undefined {
  // Try preferred engine first
  if (preferredEngine) {
    const preferred = registry.get(preferredEngine);
    if (preferred?.canHandle(filePath)) {
      return preferred;
    }
  }

  // Fall back to auto-detection
  return registry.findForFile(filePath);
}

// Export types and classes
export { EngineRegistry, CustomEngineWrapper };
export { JsxEngine, createJsxEngine } from './jsx.js';
export { EdgeEngine, createEdgeEngine } from './edge.js';
export { AbstractEngine, wrapInHtmlDocument, ensureHtmlDocument, isCompleteHtmlDocument } from './base.js';
