import { useParams } from "react-router";

export function JobResultPage() {
  const { jobId } = useParams();

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <section className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Job #{jobId}</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Processing complete
            </h1>
            <p className="mt-2 text-slate-600">
              Your file has been processed successfully.
            </p>
          </div>
          <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
            SUCCESS
          </span>
        </div>
      </section>
    </main>
  );
}
