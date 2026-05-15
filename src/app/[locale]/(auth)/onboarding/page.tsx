export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-muted/30">
      <div className="w-full max-w-2xl space-y-12 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">Welcome to LaraTenant!</h1>
          <p className="text-xl text-muted-foreground">
            We're excited to help you launch your store. Let's get started with a few quick steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: '1. Create Store', description: 'Set up your store identity', done: false },
            { title: '2. Add Products', description: 'List your first items', done: false },
            { title: '3. Launch', description: 'Go live to the world', done: false },
          ].map((step, i) => (
            <div key={i} className="bg-card border rounded-xl p-6 text-left shadow-sm">
              <div className="text-primary font-bold mb-2">{step.title}</div>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="pt-8">
          <a
            href="/create-store"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-lg font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Start Onboarding
          </a>
        </div>
      </div>
    </div>
  );
}
