export function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <section className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-slate-900">
          NL Regex Processor
        </h1>
        <p className="mt-2 text-slate-600">
          Upload CSV or Excel files and process text patterns.
        </p>
      </section>
    </main>
  );
}
