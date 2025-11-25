import React from 'react'
import { baseStyles, type BaseLayoutProps } from '../default'

/**
 * Onboarding tab styles that extend base styles
 */
const onboardingStyles = `
  ${baseStyles}
  body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }
  #root {
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .onboarding-card {
    background: white;
    border-radius: 16px;
    padding: 48px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    max-width: 600px;
    width: 100%;
  }
  .onboarding-card h1 {
    font-size: 32px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 8px;
  }
  .onboarding-card p {
    color: #6b7280;
    font-size: 16px;
    margin-bottom: 32px;
  }
  .step {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid #e5e7eb;
  }
  .step:last-child {
    border-bottom: none;
  }
  .step-number {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
  }
  .btn-primary {
    margin-top: 32px;
    width: 100%;
    padding: 14px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -10px rgba(102, 126, 234, 0.5);
  }
`

export interface OnboardingLayoutProps extends BaseLayoutProps {
  brandName?: string
}

/**
 * Onboarding layout - extends DefaultLayout with gradient background and card styling
 * Perfect for welcome/onboarding tab pages
 */
export default function OnboardingLayout({
  title = 'Welcome',
  brandName = 'My Extension',
  children,
}: OnboardingLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>
          {title} - {brandName}
        </title>
        <style dangerouslySetInnerHTML={{ __html: onboardingStyles }} />
      </head>
      <body>
        <div id="root">
          <div className="onboarding-card">{children}</div>
        </div>
      </body>
    </html>
  )
}
