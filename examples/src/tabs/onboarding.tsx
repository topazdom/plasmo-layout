/**
 * Example Plasmo tab component for onboarding
 * Uses nested layout path with dot notation
 */

// @layout('tabs.onboarding')

export default function OnboardingTab() {
  return (
    <div className="onboarding-container">
      <h1>Welcome!</h1>
      <p>Let's get you started with our extension.</p>
      
      <div className="steps">
        <div className="step">
          <span className="step-number">1</span>
          <span className="step-text">Pin the extension to your toolbar</span>
        </div>
        <div className="step">
          <span className="step-number">2</span>
          <span className="step-text">Configure your preferences</span>
        </div>
        <div className="step">
          <span className="step-number">3</span>
          <span className="step-text">Start using the extension</span>
        </div>
      </div>
      
      <button className="get-started-btn">Get Started</button>
    </div>
  );
}
