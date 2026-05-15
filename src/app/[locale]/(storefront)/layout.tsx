export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <div className="font-bold text-2xl tracking-tight">STOREFRONT</div>
          <nav className="hidden md:flex space-x-8 font-medium">
            <a href="/" className="hover:text-primary transition-colors">Home</a>
            <a href="/products" className="hover:text-primary transition-colors">Products</a>
            <a href="/categories" className="hover:text-primary transition-colors">Categories</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="relative p-2">
              Cart (0)
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            &copy; 2026 Your Store. Powered by LaraTenant Commerce.
          </p>
        </div>
      </footer>
    </div>
  );
}
