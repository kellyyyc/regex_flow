import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { isNotFoundError, getJobStatus } from "../api/jobs";
import {
  getStatusClassName,
  getPageTitle,
  getStatusDescription,
  formatCreatedDate,
  parseJobId,
} from "../shared/utils";

import type { JobStatus } from "../types/jobs";

const formatCount = (count: number) => count.toLocaleString("en-US");

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
              <p className="mt-2 text-slate-600">
                {getStatusDescription(
                  job.status,
                  job.numProcessed,
                  job.rowCount,
                )}
              </p>
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

        {!isLoading && job != null && (
          <div className="mt-2 space-y-4">
            <dl className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-slate-500">
                  Created Date
                </dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {formatCreatedDate(job.createdDate)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-slate-500">File</dt>
                <dd className="mt-1 text-sm text-slate-900">{job.fileName}</dd>
              </div>

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
            </dl>

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
          </div>
        )}
      </section>
    </main>
  );
}
