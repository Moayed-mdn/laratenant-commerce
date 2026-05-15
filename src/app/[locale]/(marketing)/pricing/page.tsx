export default function PricingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Choose the plan that's right for your business.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        {['Basic', 'Pro', 'Enterprise'].map((plan) => (
          <div key={plan} className="border rounded-lg p-6 flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-2">{plan}</h2>
            <div className="text-3xl font-bold mb-4">$X/mo</div>
            <ul className="text-left space-y-2 mb-8">
              <li>✓ Feature 1</li>
              <li>✓ Feature 2</li>
              <li>✓ Feature 3</li>
            </ul>
            <button className="mt-auto w-full bg-primary text-primary-foreground py-2 rounded-md font-medium">
              Select Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
