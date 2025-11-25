/**
 * plasmo-layout test suite
 */

import { describe, expect, it } from '@jest/globals'

import { DEFAULT_CONFIG } from './config/index.js'
import fs from 'fs-extra'
import { getOutputHtmlPath } from './utils/file-utils.js'
import os from 'os'
import { parseLayoutDecorators } from './utils/parser.js'
import path from 'path'

describe('Configuration', function () {
  it('should have correct default values', function () {
    expect(DEFAULT_CONFIG.layoutsDir).toBe('layouts')
    expect(DEFAULT_CONFIG.engine).toBe('jsx')
    expect(DEFAULT_CONFIG.include).toContain('src/**/*.{tsx,jsx}')
    expect(DEFAULT_CONFIG.exclude).toContain('**/node_modules/**')
  })
})

describe('File Utils', function () {
  describe('getOutputHtmlPath', function () {
    it('should convert index.tsx to parent directory name .html', function () {
      const result = getOutputHtmlPath('/project/src/popup/index.tsx')
      expect(result).toBe('/project/src/popup/popup.html')
    })

    it('should convert named component to same name .html', function () {
      const result = getOutputHtmlPath('/project/src/options.tsx')
      expect(result).toBe('/project/src/options.html')
    })

    it('should handle nested directories with index', function () {
      const result = getOutputHtmlPath('/project/src/tabs/settings/index.tsx')
      expect(result).toBe('/project/src/tabs/settings/settings.html')
    })

    it('should handle jsx files', function () {
      const result = getOutputHtmlPath('/project/src/popup.jsx')
      expect(result).toBe('/project/src/popup.html')
    })
  })
})

describe('Parser', function () {
  it('should parse @layout decorator from comment', async function () {
    const tempDir = path.join(os.tmpdir(), 'plasmo-layout-test')
    await fs.ensureDir(tempDir)

    const testFile = path.join(tempDir, 'test.tsx')
    await fs.writeFile(
      testFile,
      `
// @layout('default')
export default function TestComponent() {
  return <div>Test</div>;
}
    `,
    )

    const declarations = await parseLayoutDecorators(testFile)

    expect(declarations).toHaveLength(1)
    expect(declarations[0].layoutPath).toBe('default')

    await fs.remove(tempDir)
  })

  it('should parse @layout with dot notation path', async function () {
    const tempDir = path.join(os.tmpdir(), 'plasmo-layout-test-2')
    await fs.ensureDir(tempDir)

    const testFile = path.join(tempDir, 'test.tsx')
    await fs.writeFile(
      testFile,
      `
// @layout('tabs.onboarding')
export default function TestComponent() {
  return <div>Test</div>;
}
    `,
    )

    const declarations = await parseLayoutDecorators(testFile)

    expect(declarations).toHaveLength(1)
    expect(declarations[0].layoutPath).toBe('tabs.onboarding')

    await fs.remove(tempDir)
  })
})
