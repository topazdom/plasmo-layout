/**
 * Example Plasmo options page component
 * Uses the default layout
 */

// @layout('default')

export default function Options() {
  return (
    <div className="options-page">
      <h1>Extension Options</h1>
      <form>
        <label>
          <span>Enable Feature A</span>
          <input type="checkbox" />
        </label>
        <label>
          <span>API Key</span>
          <input type="text" placeholder="Enter your API key" />
        </label>
        <button type="submit">Save Options</button>
      </form>
    </div>
  );
}
