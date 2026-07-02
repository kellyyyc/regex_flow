import { Link } from "react-router";

const jobs = [
  {
    id: "1",
    fileName: "customers.csv",
    status: "SUCCESS",
    description: "Processed 1,240 rows",
  },
  {
    id: "2",
    fileName: "emails.xlsx",
    status: "WAITING",
    description: "Queued for processing",
  },
  {
    id: "3",
    fileName: "logs.csv",
    status: "FAILED",
    description: "Could not process file",
  },
];

function getStatusClassName(status: string) {
  if (status === "SUCCESS") {
    return "bg-green-100 text-green-700";
  }

  if (status === "FAILED") {
    return "bg-red-100 text-red-700";
  }

  return "bg-orange-100 text-yellow-700";
}

export function JobListPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <section className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-bold text-slate-900">Jobs</h1>
          <p className="mt-2 text-slate-600">
            View uploaded files and processing results.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              to={
                job.status === "SUCCESS"
                  ? `/jobs/${job.id}/result`
                  : `/jobs/${job.id}`
              }
              className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50"
            >
              <div>
                <h2 className="font-semibold text-slate-900">{job.fileName}</h2>
                <p className="mt-1 text-sm text-slate-600">{job.description}</p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusClassName(
                  job.status,
                )}`}
              >
                {job.status}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
