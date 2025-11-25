/**
 * Example Plasmo options page component
 * Uses the options layout which extends the default layout
 */

// @layout('options')

export default function Options() {
  return (
    <>
      <div className="options-section">
        <h2>General Settings</h2>
        <div className="option-row">
          <div>
            <div className="option-label">Enable Feature A</div>
            <div className="option-description">Allow the extension to use Feature A</div>
          </div>
          <input type="checkbox" />
        </div>
        <div className="option-row">
          <div>
            <div className="option-label">Auto-sync</div>
            <div className="option-description">Automatically sync your settings</div>
          </div>
          <input type="checkbox" defaultChecked />
        </div>
      </div>
      
      <div className="options-section">
        <h2>API Configuration</h2>
        <div className="option-row">
          <div>
            <div className="option-label">API Key</div>
            <div className="option-description">Your personal API key</div>
          </div>
          <input type="text" placeholder="Enter your API key" />
        </div>
      </div>
      
      <button className="btn-save">Save Settings</button>
    </>
  );
}
