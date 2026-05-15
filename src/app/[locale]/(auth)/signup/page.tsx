export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 border rounded-xl p-8 shadow-sm bg-card">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-muted-foreground mt-2">
            Start your 14-day free trial today.
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <input className="w-full border rounded-md p-2" placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input className="w-full border rounded-md p-2" placeholder="john@example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input className="w-full border rounded-md p-2" type="password" />
          </div>
          <button className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium">
            Sign up
          </button>
        </div>
        <div className="text-center text-sm">
          Already have an account? <a href="/login" className="text-primary hover:underline">Log in</a>
        </div>
      </div>
    </div>
  );
}
