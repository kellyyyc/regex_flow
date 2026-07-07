import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";
import { isNotFoundError, getJobStatus } from "../api/jobs";
import {
  getStatusClassName,
  getPageTitle,
  getStatusDescription,
  formatCreatedDate,
  parseJobId,
} from "../shared/utils";

import type { JobStatus } from "../types/jobs";

export function JobStatusPage() {
  const { jobId } = useParams();

  const parsedJobId = parseJobId(jobId);
  const isInvalidJobId = parsedJobId == null;

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
        setJob(null);

        const data = await getJobStatus(parsedJobId);

        if (!cancelled) {
          setJob(data);

          if (data && data.status === "FAILED") {
            setError(data.errorMessage ?? "Failed to load job error.");
          }
        }
      } catch (err) {
        console.error("Failed to fetch job status", err);

        if (!cancelled) {
          if (isNotFoundError(err)) {
            setJob(null);
          } else {
            setError("Failed to load job status.");
          }
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
              {getPageTitle(isLoading, error, job)}
            </h1>

            {isLoading ? (
              <p className="mt-2 text-slate-600">Loading job status...</p>
            ) : error ? (
              <p className="mt-2 text-red-600">{error}</p>
            ) : job == null ? (
              <p className="mt-2 text-slate-600">No status available.</p>
            ) : (
              <>
                <p className="mt-2 text-slate-600">
                  {getStatusDescription(
                    job.status,
                    job.numProcessed,
                    job.rowCount,
                  )}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Created {formatCreatedDate(job.createdDate)}
                </p>
              </>
            )}
          </div>

          {job != null && (
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusClassName(
                job.status,
              )}`}
            >
              {job.status}
            </span>
          )}
        </div>
      </section>
    </main>
  );
}
