export const metadata = { title: "Your account" };

export default function Account() {
  return (
    <main className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="border-b-2 border-ink">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <a href="/" className="text-xl font-bold tracking-tight">Mascot<span className="text-smoke">Chatbot</span></a>
          <a href="/" className="text-sm font-medium text-smoke hover:text-ink">← Back to site</a>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" />
          </svg>
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tightest">Accounts are launching soon</h1>
        <p className="mt-3 text-smoke">
          Sign-in with email and Google is on the way — you&apos;ll be able to track your order, manage your mascot, and grab your install code here. For now, you can start an order and we&apos;ll set you up.
        </p>
        <a href="/#pricing" className="mt-7 rounded-full bg-ink px-7 py-3.5 font-semibold text-paper transition hover:opacity-90">Start your order →</a>
      </div>
    </main>
  );
}
