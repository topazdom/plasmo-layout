/** @type {import('plasmo-layout').PlasmoLayoutConfig} */
export default {
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
