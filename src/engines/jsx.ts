import { pathToFileURL } from 'node:url';
import { dirname, basename, extname } from 'node:path';
import fs from 'fs-extra';
import { consola } from 'consola';
import { AbstractEngine, ensureHtmlDocument } from './base.js';
import type { EngineContext } from '../types/index.js';

/**
 * JSX/TSX templating engine
 * Renders React components to static HTML using react-dom/server
 * 
 * Supports both .tsx and .jsx layout files
 * Requires react and react-dom as peer dependencies
 */
export class JsxEngine extends AbstractEngine {
  readonly name = 'jsx';
  readonly extensions = ['.tsx', '.jsx', '.ts', '.js'];

  // Using any to avoid peer dependency type issues at build time
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private React: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ReactDOMServer: any = null;
  private initialized = false;

  /**
   * Initialize the engine by loading React dependencies
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Dynamically import React and ReactDOMServer (peer dependencies)
      this.React = await import(/* webpackIgnore: true */ 'react').catch(() => null);
      this.ReactDOMServer = await import(/* webpackIgnore: true */ 'react-dom/server').catch(() => null);

      if (!this.React || !this.ReactDOMServer) {
        throw new Error('React modules not found');
      }

      this.initialized = true;
      consola.debug('JSX engine initialized');
    } catch (error) {
      throw new Error(
        'Failed to load React dependencies. Make sure react and react-dom are installed:\n' +
          'npm install react react-dom\n\n' +
          `Original error: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  /**
   * Render a JSX/TSX layout file to HTML
   * @param templatePath - Absolute path to the layout file
   * @param context - Optional context data passed to the component
   */
  async render(templatePath: string, context?: EngineContext): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.React || !this.ReactDOMServer) {
      throw new Error('JSX engine not properly initialized');
    }

    try {
      // Read the layout file
      const content = await fs.readFile(templatePath, 'utf-8');

      // Check if it's already HTML (for simple templates)
      if (this.isStaticHtml(content)) {
        return ensureHtmlDocument(content);
      }

      // For actual JSX/TSX files, we need to compile and render them
      // This requires the file to be pre-compiled or use a runtime compiler
      const module = await this.loadModule(templatePath);
      const Component = module.default || module;

      if (typeof Component !== 'function') {
        // If it's not a component, treat the file content as a template
        return ensureHtmlDocument(content);
      }

      // Create element with context as props
      const element = this.React.createElement(Component, context || {});

      // Render to static HTML
      const html = this.ReactDOMServer.renderToStaticMarkup(element);

      return ensureHtmlDocument(html);
    } catch (error) {
      consola.error(`Failed to render JSX template: ${templatePath}`);
      throw error;
    }
  }

  /**
   * Load a module using dynamic import
   * @param modulePath - Path to the module
   */
  private async loadModule(modulePath: string): Promise<Record<string, unknown>> {
    const fileUrl = pathToFileURL(modulePath).href;

    try {
      // Try direct import (works for .js and compiled .ts files)
      return await import(fileUrl);
    } catch {
      // If direct import fails, try to find a compiled version
      const dir = dirname(modulePath);
      const name = basename(modulePath, extname(modulePath));

      // Try common compiled locations
      const alternatives = [
        `${dir}/${name}.js`,
        `${dir}/${name}.mjs`,
        `${dir}/dist/${name}.js`,
      ];

      for (const alt of alternatives) {
        if (await fs.pathExists(alt)) {
          return await import(pathToFileURL(alt).href);
        }
      }

      throw new Error(
        `Cannot import JSX/TSX module: ${modulePath}. ` +
          'Make sure the file is either a .js file or compiled to JavaScript.'
      );
    }
  }

  /**
   * Check if content is static HTML (not JSX)
   * @param content - File content
   */
  private isStaticHtml(content: string): boolean {
    const trimmed = content.trim();
    // Check for HTML indicators that suggest it's not a JSX component
    return (
      trimmed.startsWith('<!') ||
      trimmed.startsWith('<html') ||
      (trimmed.startsWith('<') && !trimmed.includes('import ') && !trimmed.includes('export '))
    );
  }
}

/**
 * Create a new JSX engine instance
 */
export function createJsxEngine(): JsxEngine {
  return new JsxEngine();
}
