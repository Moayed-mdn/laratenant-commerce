export default function FeaturesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Powerful Features</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Everything you need to succeed online.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl w-full">
        {['Multi-tenant', 'Analytics', 'Custom Domains', 'Global Support'].map((feature) => (
          <div key={feature} className="border rounded-lg p-6 text-left">
            <h2 className="text-xl font-semibold mb-2">{feature}</h2>
            <p className="text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
