import React from 'react';
import DefaultLayout, { baseStyles, type BaseLayoutProps } from './default';

/**
 * Popup-specific styles that extend base styles
 */
const popupStyles = `
  ${baseStyles}
  body {
    width: 350px;
    min-height: 400px;
  }
  #root {
    width: 100%;
    height: 100%;
    padding: 16px;
  }
  .popup-header {
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 12px;
    margin-bottom: 16px;
  }
  .popup-header h1 {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
  }
  .popup-content {
    flex: 1;
  }
  .popup-footer {
    border-top: 1px solid #e5e7eb;
    padding-top: 12px;
    margin-top: 16px;
    font-size: 12px;
    color: #6b7280;
  }
`;

export interface PopupLayoutProps extends BaseLayoutProps {
  showFooter?: boolean;
}

/**
 * Popup layout - extends DefaultLayout with popup-specific dimensions and styles
 */
export default function PopupLayout({ 
  title = 'Extension Popup',
  children,
  showFooter = true,
}: PopupLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <style dangerouslySetInnerHTML={{ __html: popupStyles }} />
      </head>
      <body>
        <div id="root">
          {children}
          {showFooter && (
            <div className="popup-footer">
              Powered by Plasmo
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
