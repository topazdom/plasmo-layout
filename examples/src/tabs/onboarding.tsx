/**
 * Example Plasmo tab component for onboarding
 * Uses nested layout path with dot notation
 * This layout extends the default layout with gradient styling
 */

// @layout('tabs.onboarding')

export default function OnboardingTab() {
  return (
    <>
      <h1>Welcome!</h1>
      <p>Let's get you started with our extension.</p>

      <div className="steps">
        <div className="step">
          <span className="step-number">1</span>
          <span>Pin the extension to your toolbar</span>
        </div>
        <div className="step">
          <span className="step-number">2</span>
          <span>Configure your preferences in the options page</span>
        </div>
        <div className="step">
          <span className="step-number">3</span>
          <span>Start using the extension!</span>
        </div>
      </div>

      <button className="btn-primary">Get Started</button>
    </>
  )
}
