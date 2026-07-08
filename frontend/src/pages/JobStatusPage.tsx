import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { isNotFoundError, getJobStatus, cancelJob } from "../api/jobs";
import {
  getPageTitle,
  getStatusDescription,
  parseJobId,
  formatCount,
} from "../shared/utils";

import type { JobStatus } from "../types/jobs";
import { JobInfoSection } from "../components/JobInfoSection";
import { StatusBadge } from "../components/StatusBadge";

export function JobStatusPage() {
  const { jobId } = useParams();

  const parsedJobId = parseJobId(jobId);
  const isInvalidJobId = parsedJobId == null;

  const [job, setJob] = useState<JobStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isInvalidJobId) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let hasLoadedOnce = false;

    const fetchStatus = async () => {
      try {
        if (!hasLoadedOnce) {
          setIsLoading(true);
        }
        setError("");

        const data = await getJobStatus(parsedJobId);

        if (!cancelled) {
          hasLoadedOnce = true;
          setJob(data);

          const isFinished =
            data == null ||
            data.status === "SUCCESS" ||
            data.status === "FAILED" ||
            data.status === "CANCELLED";

          if (!isFinished) {
            timeoutId = setTimeout(fetchStatus, 3000);
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
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [parsedJobId, isInvalidJobId]);

  if (isInvalidJobId) {
    return <Navigate to="/jobs" replace />;
  }

  const showCancelButton =
    job != null &&
    (job.status === "QUEUED" || job.status === "RUNNING") &&
    !isCancelling;

  const handleCancel = async () => {
    if (job == null) {
      return;
    }

    try {
      setIsCancelling(true);
      setError("");
      await cancelJob(job.id);
    } catch (err) {
      console.error("Failed to cancel job", err);
      setError("Failed to cancel job.");
      setIsCancelling(false);
    }
  };

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
              <p className="mt-2 text-slate-600">Job not found.</p>
            ) : (
              <p className="mt-2 text-slate-600">
                {getStatusDescription(
                  job.status,
                  job.numProcessed,
                  job.rowCount,
                )}
              </p>
            )}
          </div>

          {job != null && <StatusBadge status={job.status} />}
        </div>

        {!isLoading && job != null && (
          <div className="mt-2 space-y-4">
            <JobInfoSection job={job}>
              {job.status === "FAILED" && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-slate-500">
                    Error Message
                  </dt>
                  <dd className="mt-1 text-sm text-red-600">
                    {job.errorMessage || "Processing failed."}
                  </dd>
                </div>
              )}

              {(job.status === "RUNNING" || job.status === "SUCCESS") && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-slate-500">
                    Processing Summary
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {formatCount(job.numProcessed)} /{" "}
                    {formatCount(job.rowCount)} rows processed,{" "}
                    {formatCount(job.changedRowCount)} changed
                  </dd>
                </div>
              )}
            </JobInfoSection>

            {job.status === "SUCCESS" ? (
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/jobs/${job.id}/result`}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  View result
                </Link>
              </div>
            ) : null}

            {showCancelButton ? (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  Cancel job
                </button>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}
