import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getAllJobs } from "../api/jobs";
import { getStatusClassName, getDescription } from "../shared/utils";

import type { JobStatus } from "../types/jobs";

export function JobListPage() {
  const [jobs, setJobs] = useState<JobStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchResult = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getAllJobs();
        if (!cancelled) {
          setJobs(data);
        }
      } catch (err) {
        console.error("Failed to fetch job result", err);

        if (!cancelled) {
          setError("Failed to load job result.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchResult();

    return () => {
      cancelled = true;
    };
  }, []);

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
          {isLoading ? (
            <p className="text-slate-600">Loading jobs...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : jobs.length === 0 ? (
            <p className="text-slate-600">No jobs found.</p>
          ) : (
            jobs.map((job) => (
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
                  <h2 className="font-semibold text-slate-900">
                    {job.fileName}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {getDescription(job.status, job.numProcessed, job.rowCount)}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusClassName(
                    job.status,
                  )}`}
                >
                  {job.status}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
