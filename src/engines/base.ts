import { extname } from 'node:path';
import type { BaseEngine, EngineContext } from '../types/index.js';

/**
 * Abstract base class for templating engines
 * Provides common functionality and enforces the engine interface
 */
export abstract class AbstractEngine implements BaseEngine {
  abstract readonly name: string;
  abstract readonly extensions: string[];

  /**
   * Render a template to HTML
   * @param templatePath - Absolute path to the template file
   * @param context - Optional context data
   */
  abstract render(templatePath: string, context?: EngineContext): Promise<string>;

  /**
   * Check if this engine can handle a given file based on extension
   * @param filePath - File path to check
   */
  canHandle(filePath: string): boolean {
    const ext = extname(filePath).toLowerCase();
    return this.extensions.includes(ext);
  }

  /**
   * Optional initialization hook
   */
  async initialize(): Promise<void> {
    // Default implementation does nothing
  }

  /**
   * Optional cleanup hook
   */
  async cleanup(): Promise<void> {
    // Default implementation does nothing
  }
}

/**
 * Wrap HTML content in a basic HTML document structure
 * @param content - Inner HTML content
 * @param title - Optional page title
 */
export function wrapInHtmlDocument(content: string, title = 'Plasmo Layout'): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body>
  <div id="root">${content}</div>
</body>
</html>`;
}

/**
 * Check if a string is already a complete HTML document
 * @param content - HTML content to check
 */
export function isCompleteHtmlDocument(content: string): boolean {
  const trimmed = content.trim().toLowerCase();
  return trimmed.startsWith('<!doctype') || trimmed.startsWith('<html');
}

/**
 * Ensure content is a complete HTML document
 * @param content - HTML content
 * @param title - Optional page title
 */
export function ensureHtmlDocument(content: string, title?: string): string {
  if (isCompleteHtmlDocument(content)) {
    return content;
  }
  return wrapInHtmlDocument(content, title);
}
