import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import fs from 'fs-extra'
import { consola } from 'consola'
import type { PlasmoLayoutConfig, ResolvedConfig, EngineType } from '../types/index.js'

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Required<Omit<PlasmoLayoutConfig, 'customEngine' | 'outputDir'>> = {
  include: ['src/**/*.{tsx,jsx}'],
  exclude: [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/*.test.{ts,tsx,js,jsx}',
    '**/*.spec.{ts,tsx,js,jsx}',
    '**/__tests__/**',
  ],
  layoutsDir: 'layouts',
  engine: 'jsx',
  extensionFallback: {
    jsx: ['.tsx', '.jsx', '.ts', '.js'],
    edge: ['.edge'],
    custom: [],
  },
  verbose: false,
}

/**
 * Possible config file names to search for
 */
const CONFIG_FILE_NAMES = [
  'plasmo-layout.config.js',
  'plasmo-layout.config.mjs',
  'plasmo-layout.config.cjs',
  'plasmo-layout.config.ts',
]

/**
 * Find the config file in the project root
 * @param rootDir - Project root directory
 * @returns Path to config file or undefined if not found
 */
async function findConfigFile(rootDir: string): Promise<string | undefined> {
  for (const filename of CONFIG_FILE_NAMES) {
    const configPath = resolve(rootDir, filename)
    if (await fs.pathExists(configPath)) {
      return configPath
    }
  }
  return undefined
}

/**
 * Load user configuration from file
 * @param configPath - Path to the config file
 * @returns User configuration object
 */
async function loadConfigFile(configPath: string): Promise<PlasmoLayoutConfig> {
  try {
    // Use dynamic import for ES modules
    const fileUrl = pathToFileURL(configPath).href
    const module = await import(fileUrl)
    return module.default || module
  } catch (error) {
    consola.error(`Failed to load config file: ${configPath}`)
    throw error
  }
}

/**
 * Resolve and merge configuration with defaults
 * @param userConfig - User-provided configuration
 * @param rootDir - Project root directory
 * @returns Fully resolved configuration
 */
function resolveConfig(userConfig: PlasmoLayoutConfig, rootDir: string): ResolvedConfig {
  const merged = {
    ...DEFAULT_CONFIG,
    ...userConfig,
    extensionFallback: {
      ...DEFAULT_CONFIG.extensionFallback,
      ...userConfig.extensionFallback,
    },
  }

  // Validate custom engine configuration
  if (merged.engine === 'custom' && !userConfig.customEngine) {
    throw new Error('Custom engine selected but no customEngine configuration provided')
  }

  return {
    ...merged,
    customEngine: userConfig.customEngine,
    outputDir: userConfig.outputDir,
    rootDir,
    layoutsDirAbsolute: resolve(rootDir, merged.layoutsDir),
  }
}

/**
 * Load and resolve configuration
 * @param rootDir - Project root directory (defaults to cwd)
 * @param configPath - Optional explicit path to config file
 * @returns Resolved configuration
 */
export async function loadConfig(rootDir: string = process.cwd(), configPath?: string): Promise<ResolvedConfig> {
  const absoluteRootDir = resolve(rootDir)

  // Find or use provided config file
  const configFilePath = configPath ? resolve(absoluteRootDir, configPath) : await findConfigFile(absoluteRootDir)

  let userConfig: PlasmoLayoutConfig = {}

  if (configFilePath) {
    if (!(await fs.pathExists(configFilePath))) {
      throw new Error(`Config file not found: ${configFilePath}`)
    }
    consola.debug(`Loading config from: ${configFilePath}`)
    userConfig = await loadConfigFile(configFilePath)
  } else {
    consola.debug('No config file found, using defaults')
  }

  return resolveConfig(userConfig, absoluteRootDir)
}

/**
 * Create a default config file in the project root
 * @param rootDir - Project root directory
 * @param format - Config file format
 */
export async function createDefaultConfig(
  rootDir: string = process.cwd(),
  format: 'js' | 'ts' = 'js',
): Promise<string> {
  const filename = format === 'ts' ? 'plasmo-layout.config.ts' : 'plasmo-layout.config.js'
  const configPath = resolve(rootDir, filename)

  if (await fs.pathExists(configPath)) {
    throw new Error(`Config file already exists: ${configPath}`)
  }

  const content =
    format === 'ts'
      ? `import type { PlasmoLayoutConfig } from 'plasmo-layout';

const config: PlasmoLayoutConfig = {
  // Glob patterns for files to scan for @layout decorators
  include: ['src/**/*.{tsx,jsx}'],
  
  // Glob patterns to exclude from scanning
  exclude: [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
  ],
  
  // Directory containing layout templates
  layoutsDir: 'layouts',
  
  // Templating engine: 'jsx' | 'edge' | 'custom'
  engine: 'jsx',
  
  // Enable verbose logging
  verbose: false,
};

export default config;
`
      : `/** @type {import('plasmo-layout').PlasmoLayoutConfig} */
const config = {
  // Glob patterns for files to scan for @layout decorators
  include: ['src/**/*.{tsx,jsx}'],
  
  // Glob patterns to exclude from scanning
  exclude: [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
  ],
  
  // Directory containing layout templates
  layoutsDir: 'layouts',
  
  // Templating engine: 'jsx' | 'edge' | 'custom'
  engine: 'jsx',
  
  // Enable verbose logging
  verbose: false,
};

export default config;
`

  await fs.writeFile(configPath, content, 'utf-8')
  consola.success(`Created config file: ${configPath}`)

  return configPath
}

/**
 * Validate configuration
 * @param config - Configuration to validate
 * @throws Error if configuration is invalid
 */
export function validateConfig(config: ResolvedConfig): void {
  // Validate include patterns
  if (!config.include.length) {
    throw new Error('At least one include pattern is required')
  }

  // Validate engine type
  const validEngines: EngineType[] = ['jsx', 'edge', 'custom']
  if (!validEngines.includes(config.engine)) {
    throw new Error(`Invalid engine: ${config.engine}. Must be one of: ${validEngines.join(', ')}`)
  }

  // Validate custom engine config
  if (config.engine === 'custom') {
    if (!config.customEngine?.path) {
      throw new Error('customEngine.path is required when using custom engine')
    }
  }

  // Validate layouts directory exists (warn only)
  if (!fs.existsSync(config.layoutsDirAbsolute)) {
    consola.warn(`Layouts directory does not exist: ${config.layoutsDirAbsolute}`)
  }
}
