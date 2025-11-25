import { consola } from 'consola';
import type { ResolvedConfig, BuildSummary, ProcessingResult, ProcessedComponent } from '../../types/index.js';
import { getMatchingFiles, resolveLayoutPath, writeGeneratedHtml, getRelativePath } from '../../utils/index.js';
import { processComponentFiles } from '../../utils/parser.js';
import { createEngineRegistry, getEngineForFile } from '../../engines/index.js';

/**
 * Execute the build command - scan components and generate HTML files
 * @param config - Resolved configuration
 * @returns Build summary with results
 */
export async function executeBuild(config: ResolvedConfig): Promise<BuildSummary> {
  const startTime = Date.now();
  const results: ProcessingResult[] = [];

  consola.start('Starting plasmo-layout build...');

  // Step 1: Discover all matching files
  consola.info('Scanning for components...');
  const files = await getMatchingFiles(config);
  consola.debug(`Found ${files.length} files matching patterns`);

  // Step 2: Parse files for @layout decorators
  consola.info('Parsing components for @layout decorators...');
  const components = await processComponentFiles(files);
  consola.info(`Found ${components.length} components with layouts`);

  if (components.length === 0) {
    consola.warn('No components with @layout decorators found');
    return {
      totalScanned: files.length,
      componentsWithLayouts: 0,
      successCount: 0,
      failureCount: 0,
      results: [],
      duration: Date.now() - startTime,
    };
  }

  // Step 3: Initialize engine registry
  consola.info('Initializing templating engines...');
  const registry = await createEngineRegistry(config);
  await registry.initializeAll();

  // Step 4: Process each component
  for (const component of components) {
    const result = await processComponent(component, config, registry);
    results.push(result);

    if (result.success) {
      consola.success(
        `Generated: ${getRelativePath(result.component.outputPath, config.rootDir)}`
      );
    } else {
      consola.error(
        `Failed: ${getRelativePath(result.component.sourcePath, config.rootDir)} - ${result.error}`
      );
    }
  }

  // Step 5: Cleanup engines
  await registry.cleanupAll();

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;
  const duration = Date.now() - startTime;

  consola.info('');
  consola.box(
    `Build Complete\n\n` +
      `Total scanned: ${files.length}\n` +
      `With layouts: ${components.length}\n` +
      `Generated: ${successCount}\n` +
      `Failed: ${failureCount}\n` +
      `Duration: ${duration}ms`
  );

  return {
    totalScanned: files.length,
    componentsWithLayouts: components.length,
    successCount,
    failureCount,
    results,
    duration,
  };
}

/**
 * Process a single component
 */
async function processComponent(
  component: ProcessedComponent,
  config: ResolvedConfig,
  registry: Awaited<ReturnType<typeof createEngineRegistry>>
): Promise<ProcessingResult> {
  const startTime = Date.now();

  try {
    // Use the first layout declaration (typically there's only one per component)
    const layoutDeclaration = component.layouts[0];
    if (!layoutDeclaration) {
      return {
        component,
        success: false,
        error: 'No layout declaration found',
        duration: Date.now() - startTime,
      };
    }

    // Resolve layout path
    const resolved = await resolveLayoutPath(layoutDeclaration.layoutPath, config);
    if (!resolved) {
      return {
        component,
        success: false,
        error: `Layout not found: ${layoutDeclaration.layoutPath}`,
        duration: Date.now() - startTime,
      };
    }

    component.resolvedLayoutPath = resolved.path;
    component.engineType = resolved.engineType;

    // Get appropriate engine
    const engine = getEngineForFile(registry, resolved.path, resolved.engineType);
    if (!engine) {
      return {
        component,
        success: false,
        error: `No engine available for: ${resolved.path}`,
        duration: Date.now() - startTime,
      };
    }

    // Render the layout
    const html = await engine.render(resolved.path, {
      componentPath: component.sourcePath,
      outputPath: component.outputPath,
    });

    // Write the generated HTML
    await writeGeneratedHtml(component.outputPath, html);

    return {
      component,
      success: true,
      html,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      component,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Process a single file (for incremental builds in watch mode)
 * @param filePath - Path to the component file
 * @param config - Resolved configuration
 * @returns Processing result or null if file has no layouts
 */
export async function processSingleFile(
  filePath: string,
  config: ResolvedConfig
): Promise<ProcessingResult | null> {
  const components = await processComponentFiles([filePath]);

  if (components.length === 0) {
    return null;
  }

  const registry = await createEngineRegistry(config);
  await registry.initializeAll();

  const result = await processComponent(components[0], config, registry);

  await registry.cleanupAll();

  return result;
}
