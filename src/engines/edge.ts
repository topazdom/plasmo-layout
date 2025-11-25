import fs from 'fs-extra';
import { consola } from 'consola';
import { AbstractEngine, ensureHtmlDocument } from './base.js';
import type { EngineContext } from '../types/index.js';

/**
 * Edge.js templating engine
 * Uses Edge.js for template rendering
 * 
 * Supports .edge layout files
 * Requires edge.js as a peer dependency
 */
export class EdgeEngine extends AbstractEngine {
  readonly name = 'edge';
  readonly extensions = ['.edge'];

  private edge: { render: (template: string, state?: Record<string, unknown>) => Promise<string> } | null = null;
  private initialized = false;

  /**
   * Initialize the engine by loading Edge.js
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Dynamically import Edge.js
      const edgeModule = await import('edge.js');
      this.edge = edgeModule.default || edgeModule;
      this.initialized = true;
      consola.debug('Edge engine initialized');
    } catch (error) {
      throw new Error(
        'Failed to load Edge.js. Make sure edge.js is installed:\n' +
          'npm install edge.js\n\n' +
          `Original error: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Render an Edge template file to HTML
   * @param templatePath - Absolute path to the layout file
   * @param context - Optional context data passed to the template
   */
  async render(templatePath: string, context?: EngineContext): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.edge) {
      throw new Error('Edge engine not properly initialized');
    }

    try {
      // Read the template file content
      const templateContent = await fs.readFile(templatePath, 'utf-8');

      // Render the template with context
      const html = await this.edge.render(templateContent, context || {});

      return ensureHtmlDocument(html);
    } catch (error) {
      consola.error(`Failed to render Edge template: ${templatePath}`);
      throw error;
    }
  }
}

/**
 * Create a new Edge engine instance
 */
export function createEdgeEngine(): EdgeEngine {
  return new EdgeEngine();
}
