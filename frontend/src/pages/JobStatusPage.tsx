import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";
import { getJobStatus } from "../api/jobs";
import { getStatusClassName, getDescription } from "../shared/utils";

import type { JobStatus } from "../types/jobs";

export function JobStatusPage() {
  const { jobId } = useParams();

  const parsedJobId = Number(jobId);
  const isInvalidJobId =
    jobId == null || !Number.isInteger(parsedJobId) || parsedJobId <= 0;

  const [job, setJob] = useState<JobStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isInvalidJobId) return;

    let cancelled = false;

    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getJobStatus(parsedJobId);

        if (!cancelled) {
          setJob(data);
        }
      } catch (err) {
        console.error("Failed to fetch job status", err);

        if (!cancelled) {
          setError("Failed to load job status.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchStatus();

    return () => {
      cancelled = true;
    };
  }, [parsedJobId, isInvalidJobId]);

  if (isInvalidJobId) {
    return <Navigate to="/jobs" replace />;
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <section className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Job #{parsedJobId}
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Currently processing
            </h1>

            {isLoading ? (
              <p className="mt-2 text-slate-600">Loading job status...</p>
            ) : error ? (
              <p className="mt-2 text-red-600">{error}</p>
            ) : job == null ? (
              <p className="text-slate-600">No jobs found.</p>
            ) : (
              <p className="mt-2 text-slate-600">
                {getDescription(job.status, job.numProcessed, job.rowCount)}
              </p>
            )}
          </div>

          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusClassName(
              job?.status ?? null,
            )}`}
          >
            {job?.status ?? "LOADING"}
          </span>
        </div>
      </section>
    </main>
  );
}
