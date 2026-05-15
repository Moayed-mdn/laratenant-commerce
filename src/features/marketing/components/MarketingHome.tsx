import Link from 'next/link';

export function MarketingHome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to LaraTenant Commerce</h1>
      <p className="text-xl text-muted-foreground mb-8">
        The all-in-one platform to launch and scale your e-commerce business.
      </p>
      <div className="flex gap-4">
        <Link href="/login" className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90">
          Get Started
        </Link>
        <Link href="/pricing" className="border px-6 py-2 rounded-md font-medium hover:bg-accent">
          View Pricing
        </Link>
      </div>
    </div>
  );
}
