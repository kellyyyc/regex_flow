import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";
import { getJobResult } from "../api/jobs";
import { parseJobId } from "../shared/utils";

import type { JobResult } from "../types/jobs";

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

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <section className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Job #{parsedJobId}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              {error
                ? "Unable to load job"
                : result == null
                  ? isLoading
                    ? "Loading job"
                    : "Job not found"
                  : "Processing complete"}
            </h1>
            {isLoading ? (
              <p className="mt-2 text-slate-600">Loading job status...</p>
            ) : error ? (
              <p className="mt-2 text-red-600">{error}</p>
            ) : result == null ? (
              <p className="mt-2 text-slate-600">No results available.</p>
            ) : (
              <p className="mt-2 text-slate-600">
                Your file has been processed successfully.
              </p>
            )}
          </div>
          {result != null && (
            <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
              SUCCESS
            </span>
          )}
        </div>

        <div className="mt-6">
          {isLoading ? (
            <p className="text-slate-600">Loading result...</p>
          ) : result == null ? null : result.previewRows.length === 0 ? (
            <p className="text-slate-600">No preview rows found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr>
                    {result.columnHeaders.map((column) => (
                      <th
                        key={column}
                        className="border-b border-slate-200 px-3 py-2 font-semibold text-slate-700"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {result.previewRows.map((row, index) => (
                    <tr key={index}>
                      {result.columnHeaders.map((column) => (
                        <td
                          key={column}
                          className="border-b border-slate-100 px-3 py-2 text-slate-700"
                        >
                          {String(row[column] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
