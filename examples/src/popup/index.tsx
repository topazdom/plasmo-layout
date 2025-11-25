/**
 * Example Plasmo popup component
 * The @layout decorator tells plasmo-layout which layout template to use
 * This uses the popup layout which extends the default layout with popup-specific styles
 */

// @layout('popup')

export default function Popup() {
  return (
    <>
      <div className="popup-header">
        <h1>My Extension</h1>
      </div>
      <div className="popup-content">
        <p>Welcome! This popup uses a custom layout that extends the base layout.</p>
        <button onClick={() => alert('Hello!')}>Click Me</button>
      </div>
    </>
  );
}
