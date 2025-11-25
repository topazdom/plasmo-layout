<h1 align="center">Plasmo Layout</h1>

<p align="center">
    <i>Automate <strong>HTML layout</strong> generation for <a href="https://plasmo.com"> Plasmo </a> browser extension components.</i>
</p>

<p align="center">
  <a href="https://github.com/topazdom/plasmo-layout/actions/workflows/ci.yml">
    <img src="https://github.com/topazdom/plasmo-layout/actions/workflows/ci.yml/badge.svg" alt="GitHub Action Status" />
  </a>
  <a href="https://github.com/topazdom/plasmo-layout/issues">
    <img src="https://img.shields.io/github/issues/topazdom/plasmo-layout" alt="Issues" />
  </a>
  <a href="https://www.npmtrends.com/plasmo-layout">
    <img src="https://img.shields.io/npm/dt/plasmo-layout" alt="Downloads" />
  </a>
  <a href="https://www.npmjs.com/package/plasmo-layout">
    <img src="https://img.shields.io/npm/v/plasmo-layout.svg?logo=npm&logoColor=fff&label=NPM&color=limegreen" alt="npm" />
  </a>
  <a href="https://github.com/prettier/prettier">
    <img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat" alt="Prettier"/>
  </a>
  <a href="https://conventionalcommits.org">
    <img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg" alt="Conventional Commits"/>
  </a>
  <a href="https://github.com/semantic-release/semantic-release">
    <img src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg" alt="Semantic Release" />
  </a>
</p>

> We're seeking [consulting and engineering opportunities](mailto://contact@topazdom.com). With Love ❤️ from Biafra.


## Overview

`plasmo-layout` is a CLI tool that automatically generates HTML files for [Plasmo](https://plasmo.com) browser extension components. It scans your component files for `@layout` decorators and generates the corresponding HTML files that Plasmo uses to override default component HTML.

## Features

- 🔍 **Auto-discovery** - Scans components for `@layout('path')` decorators
- 🎨 **Multiple engines** - Supports JSX, Edge.js, and custom templating engines
- 📁 **Plasmo conventions** - Follows Plasmo's HTML file naming conventions
- 👀 **Watch mode** - Incremental rebuilds on file changes
- 🧹 **Clean command** - Remove all generated files with one command
- ⚙️ **Configurable** - Flexible include/exclude patterns

## Installation

```bash
npm install --save-dev plasmo-layout
```

### Peer Dependencies

Depending on which templating engine you use, install the corresponding peer dependency:

```bash
# For JSX layouts (default)
npm install react react-dom

# For Edge.js layouts
npm install edge.js
```

## Quick Start

1. **Initialize configuration** (optional):

   ```bash
   npx plasmo-layout init
   ```
2. **Create a layout file** in `layouts/` directory:

   ```jsx
   // layouts/default.tsx
   export default function DefaultLayout() {
     return (
       <html>
         <head>
           <title>My Extension</title>
         </head>
         <body>
           <div id="root"></div>
         </body>
       </html>
     );
   }
   ```
3. **Add `@layout` decorator** to your Plasmo component:

   ```tsx
   // src/popup/index.tsx
   // @layout('default')

   export default function Popup() {
     return <div>Hello from Popup!</div>;
   }
   ```
4. **Run the build**:

   ```bash
   npx plasmo-layout build
   ```

   This generates `src/popup/popup.html` based on your layout.

## CLI Commands

### `build`

Scan components and generate HTML files.

```bash
plasmo-layout build [options]

Options:
  -c, --config <path>   Path to config file
  -r, --root <path>     Project root directory (default: cwd)
  -v, --verbose         Enable verbose logging
```

### `watch`

Watch for file changes and rebuild incrementally.

```bash
plasmo-layout watch [options]

Options:
  -c, --config <path>   Path to config file
  -r, --root <path>     Project root directory (default: cwd)
  -v, --verbose         Enable verbose logging
```

### `clean`

Remove all generated HTML files.

```bash
plasmo-layout clean [options]

Options:
  -c, --config <path>   Path to config file
  -r, --root <path>     Project root directory (default: cwd)
  -d, --dry-run         Show what would be deleted
  -v, --verbose         Enable verbose logging
```

### `init`

Create a default configuration file.

```bash
plasmo-layout init [options]

Options:
  -r, --root <path>     Project root directory (default: cwd)
  -t, --typescript      Create TypeScript config file
```

## Configuration

Create a `plasmo-layout.config.js` (or `.ts`, `.mjs`, `.cjs`) file in your project root:

```javascript
/** @type {import('plasmo-layout').PlasmoLayoutConfig} */
export default {
  // Glob patterns for files to scan
  include: ['src/**/*.{tsx,jsx}'],
  
  // Glob patterns to exclude
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
```

### Custom Engine

To use a custom templating engine:

```javascript
// plasmo-layout.config.js
export default {
  engine: 'custom',
  customEngine: {
    path: './my-custom-engine.js',
  },
};
```

Your custom engine must implement the `CustomEngine` interface:

```typescript
// my-custom-engine.js
export default {
  name: 'my-engine',
  extensions: ['.myext'],
  
  async render(templatePath, context) {
    // Read template, process it, return HTML string
    return '<html>...</html>';
  },
  
  // Optional hooks
  async initialize() {},
  async cleanup() {},
};
```

## Layout Path Resolution

The `@layout` decorator uses dot notation to specify layout paths:

| Decorator                           | Resolved Path                              |
| ----------------------------------- | ------------------------------------------ |
| `@layout('default')`              | `layouts/default.{tsx,jsx}`              |
| `@layout('tabs.onboarding')`      | `layouts/tabs/onboarding.{tsx,jsx}`      |
| `@layout('admin.dashboard.main')` | `layouts/admin/dashboard/main.{tsx,jsx}` |

## Output Naming Convention

Following Plasmo conventions:

| Component Path            | Generated HTML               |
| ------------------------- | ---------------------------- |
| `src/popup/index.tsx`   | `src/popup/popup.html`     |
| `src/popup.tsx`         | `src/popup.html`           |
| `src/options/index.tsx` | `src/options/options.html` |
| `src/tabs/settings.tsx` | `src/tabs/settings.html`   |

## Generated File Tracking

Generated HTML files include a special comment header:

```html
<!-- GENERATED BY PLASMO-LAYOUT - DO NOT EDIT MANUALLY -->
```

This allows the `clean` command to identify and remove only generated files.

## Programmatic API

You can also use plasmo-layout programmatically:

```typescript
import { loadConfig, executeBuild, executeClean, executeWatch } from 'plasmo-layout';

// Load configuration
const config = await loadConfig('./my-project');

// Run build
const summary = await executeBuild(config);
console.log(`Generated ${summary.successCount} files`);

// Run clean
const cleanResult = await executeClean(config);

// Start watch mode
const watcher = await executeWatch(config, {
  onProcessComplete: (file, success) => {
    console.log(`Processed: ${file}, Success: ${success}`);
  },
});

// Later: stop watching
await watcher.stop();
```

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This Project is MIT Licensed
