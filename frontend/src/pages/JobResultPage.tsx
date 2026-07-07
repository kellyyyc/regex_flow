import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";

import { getJobResult } from "../api/jobs";
import {
  parseJobId,
  getPageTitle,
  getStatusClassName,
  formatCreatedDate,
} from "../shared/utils";
import { JobPreviewTable } from "../components/JobPreviewTable";

import type { JobResult } from "../types/jobs";

const formatCount = (count: number) => count.toLocaleString("en-US");

export function JobResultPage() {
  const { jobId } = useParams();
  const parsedJobId = parseJobId(jobId);
  const isInvalidJobId = parsedJobId == null;

  const [result, setResult] = useState<JobResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isInvalidJobId) return;

    let cancelled = false;

    const fetchResult = async () => {
      try {
        setIsLoading(true);
        setError("");
        setResult(null);

        const data = await getJobResult(parsedJobId);
        if (!cancelled) {
          setResult(data);

          if (data && data.status === "FAILED") {
            setError(data.errorMessage ?? "Failed to load job error.");
          }
        }
      } catch (err) {
        console.error("Failed to fetch job result", err);

        if (!cancelled) {
          setError("Failed to load job status.");
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
  }, [parsedJobId, isInvalidJobId]);

  if (isInvalidJobId) {
    return <Navigate to="/jobs" replace />;
  }

  if (!isLoading && result != null && result.status !== "SUCCESS") {
    return <Navigate to={`/jobs/${parsedJobId}`} replace />;
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
              {getPageTitle(isLoading, error, result)}
            </h1>
            {isLoading ? (
              <p className="mt-2 text-slate-600">Loading results...</p>
            ) : error ? (
              <p className="mt-2 text-red-600">{error}</p>
            ) : result == null ? (
              <p className="mt-2 text-slate-600">Job not found.</p>
            ) : (
              <p className="mt-2 text-slate-600">
                Processing finished successfully.
              </p>
            )}
          </div>
          {result != null && (
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusClassName(
                result.status,
              )}`}
            >
              {result.status}
            </span>
          )}
        </div>

        <div className="mt-2">
          {!isLoading && !error && result != null ? (
            <div className="space-y-6">
              <dl className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-slate-500">
                    Created Date
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {formatCreatedDate(result.createdDate)}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-slate-500">
                    File Name
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {result.fileName}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-slate-500">
                    User Input - Natural Language
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {result.instruction}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">
                    LLM Output - Regex Pattern
                  </dt>
                  <dd className="mt-1 break-all rounded-lg bg-white px-3 py-2 font-mono text-sm text-slate-900">
                    {result.regexPattern || "Not available."}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">
                    Replacement Value
                  </dt>
                  <dd className="mt-1 rounded-lg bg-white px-3 py-2 font-mono text-sm text-slate-900">
                    {result.replacement || "Not available."}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-slate-500">
                    Rows Changed
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {formatCount(result.changedRowCount)} of{" "}
                    {formatCount(result.rowCount)} rows changed
                  </dd>
                </div>
              </dl>

              <JobPreviewTable job={result} />
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
