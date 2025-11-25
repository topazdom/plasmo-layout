import fs from 'fs-extra'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import type { LayoutDeclaration, ProcessedComponent } from '../types/index.js'
import { getOutputHtmlPath } from './file-utils.js'

/**
 * Regular expression to match @layout('path') or @layout("path") decorators
 * Matches both comment-style and decorator-style usage
 */
const LAYOUT_DECORATOR_REGEX = /@layout\s*\(\s*['"]([^'"]+)['"]\s*\)/g

/**
 * Parse a source file and extract @layout decorator declarations
 * Uses Babel parser for accurate AST parsing of JSX/TSX files
 *
 * @param filePath - Absolute path to the source file
 * @returns Array of layout declarations found in the file
 */
export async function parseLayoutDecorators(filePath: string): Promise<LayoutDeclaration[]> {
  const content = await fs.readFile(filePath, 'utf-8')
  const declarations: LayoutDeclaration[] = []

  // First, try comment-based @layout detection (works without full AST)
  // This allows @layout to be used in comments for flexibility
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    let match: RegExpExecArray | null

    // Reset regex state
    LAYOUT_DECORATOR_REGEX.lastIndex = 0

    while ((match = LAYOUT_DECORATOR_REGEX.exec(line)) !== null) {
      declarations.push({
        layoutPath: match[1],
        line: i + 1,
        column: match.index + 1,
      })
    }
  }

  // If we found declarations via regex, return them
  if (declarations.length > 0) {
    return declarations
  }

  // Try AST-based parsing for decorator syntax
  try {
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy'],
      errorRecovery: true,
    })

    // Use the default export from @babel/traverse
    const traverseFn = (traverse as unknown as { default: typeof traverse }).default || traverse

    traverseFn(ast, {
      // Look for decorator expressions
      Decorator(path) {
        const { expression } = path.node

        if (
          expression.type === 'CallExpression' &&
          expression.callee.type === 'Identifier' &&
          expression.callee.name === 'layout'
        ) {
          const arg = expression.arguments[0]
          if (arg && arg.type === 'StringLiteral') {
            declarations.push({
              layoutPath: arg.value,
              line: path.node.loc?.start.line || 0,
              column: path.node.loc?.start.column || 0,
            })
          }
        }
      },

      // Also check for call expressions (for non-decorator usage)
      CallExpression(path) {
        const { callee } = path.node

        if (callee.type === 'Identifier' && callee.name === 'layout') {
          const arg = path.node.arguments[0]
          if (arg && arg.type === 'StringLiteral') {
            // Check if this is actually a decorator-like usage (in comments or as first statement)
            const parent = path.parentPath
            if (parent?.isExpressionStatement()) {
              declarations.push({
                layoutPath: arg.value,
                line: path.node.loc?.start.line || 0,
                column: path.node.loc?.start.column || 0,
              })
            }
          }
        }
      },
    })
  } catch {
    // If AST parsing fails, we already tried regex
    // Just return what we have (likely empty)
  }

  return declarations
}

/**
 * Check if a file contains any @layout declarations
 * Quick check without full parsing
 *
 * @param filePath - Absolute path to the source file
 * @returns true if file appears to contain @layout declarations
 */
export async function hasLayoutDecorator(filePath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return content.includes('@layout(') || content.includes('@layout (')
  } catch {
    return false
  }
}

/**
 * Process a component file and extract layout information
 *
 * @param filePath - Absolute path to the component file
 * @returns ProcessedComponent with layout declarations and output path
 */
export async function processComponentFile(filePath: string): Promise<ProcessedComponent> {
  const layouts = await parseLayoutDecorators(filePath)
  const outputPath = getOutputHtmlPath(filePath)

  return {
    sourcePath: filePath,
    outputPath,
    layouts,
  }
}

/**
 * Batch process multiple component files
 *
 * @param filePaths - Array of absolute file paths
 * @returns Array of processed components (only those with layouts)
 */
export async function processComponentFiles(filePaths: string[]): Promise<ProcessedComponent[]> {
  const results: ProcessedComponent[] = []

  for (const filePath of filePaths) {
    // Quick check first
    if (!(await hasLayoutDecorator(filePath))) {
      continue
    }

    const component = await processComponentFile(filePath)
    if (component.layouts.length > 0) {
      results.push(component)
    }
  }

  return results
}
