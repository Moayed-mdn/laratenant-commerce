export default function CreateStorePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8 bg-card border rounded-xl p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create your store</h1>
          <p className="text-muted-foreground mt-2">
            Give your store a name and a unique URL.
          </p>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Store Name</label>
            <input className="w-full border rounded-md p-2" placeholder="My Awesome Store" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Store URL</label>
            <div className="flex items-center">
              <input className="flex-1 border rounded-l-md p-2" placeholder="my-store" />
              <span className="bg-muted border border-l-0 rounded-r-md px-3 py-2 text-sm text-muted-foreground">
                .laratenant.com
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              You can connect a custom domain later.
            </p>
          </div>

          <button className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium">
            Create Store
          </button>
        </form>
      </div>
    </div>
  );
}
