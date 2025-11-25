import React, { type ReactNode } from 'react'

/**
 * Base layout props interface - all layouts can extend this
 */
export interface BaseLayoutProps {
  title?: string
  children?: ReactNode
}

/**
 * Base styles shared across all layouts
 */
export const baseStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    line-height: 1.6;
  }
  #root {
    width: 100%;
    min-height: 100vh;
  }
`

/**
 * Default base layout - other layouts can extend this
 */
export default function DefaultLayout({ title = 'Plasmo Extension', children }: BaseLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <style dangerouslySetInnerHTML={{ __html: baseStyles }} />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
