import { useParams } from "react-router";

export function JobStatusPage() {
  const { jobId } = useParams();

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <section className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Job #{jobId}</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Currently processing
            </h1>
            <p className="mt-2 text-slate-600">Your file is being processed.</p>
          </div>
          <span className="w-fit rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-yellow-700">
            WAITING
          </span>
        </div>
      </section>
    </main>
  );
}
