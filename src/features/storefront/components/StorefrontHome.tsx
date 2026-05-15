export function StorefrontHome() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-muted py-24 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-5xl font-extrabold mb-6">Discover Our Collection</h1>
          <p className="text-xl text-muted-foreground mb-10">
            High-quality products curated just for you. Shop the latest trends and essentials.
          </p>
          <button className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold text-lg hover:shadow-lg transition-all">
            Shop Now
          </button>
        </div>
      </section>

      {/* Placeholder for Products */}
      <section className="py-20 container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="group cursor-pointer">
              <div className="aspect-square bg-muted rounded-xl mb-4 group-hover:opacity-90 transition-opacity" />
              <h3 className="font-semibold text-lg">Product Name {i}</h3>
              <p className="text-muted-foreground">$99.00</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
