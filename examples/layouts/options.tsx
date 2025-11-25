import React from 'react'
import { baseStyles, type BaseLayoutProps } from './default'

/**
 * Options page styles that extend base styles
 */
const optionsStyles = `
  ${baseStyles}
  body {
    background: #f3f4f6;
    min-height: 100vh;
  }
  #root {
    max-width: 800px;
    margin: 0 auto;
    padding: 32px 24px;
  }
  .options-header {
    margin-bottom: 32px;
  }
  .options-header h1 {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 4px;
  }
  .options-header p {
    color: #6b7280;
    font-size: 14px;
  }
  .options-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  .options-section h2 {
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
  }
  .option-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
  }
  .option-row:not(:last-child) {
    border-bottom: 1px solid #f3f4f6;
  }
  .option-label {
    font-size: 14px;
    color: #374151;
  }
  .option-description {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 2px;
  }
  .btn-save {
    padding: 12px 24px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }
  .btn-save:hover {
    background: #2563eb;
  }
`

export interface OptionsLayoutProps extends BaseLayoutProps {
  description?: string
}

/**
 * Options layout - extends DefaultLayout with settings-page styling
 * Perfect for extension options/settings pages
 */
export default function OptionsLayout({
  title = 'Options',
  description = 'Configure your extension settings',
  children,
}: OptionsLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <style dangerouslySetInnerHTML={{ __html: optionsStyles }} />
      </head>
      <body>
        <div id="root">
          <div className="options-header">
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {children}
        </div>
      </body>
    </html>
  )
}
