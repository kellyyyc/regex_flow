import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";
import { getJobResult } from "../api/jobs";

import type { JobResult } from "../types/jobs";

export function JobResultPage() {
  const { jobId } = useParams();

  const [result, setResult] = useState<JobResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const parsedJobId = Number(jobId);
  const isInvalidJobId =
    jobId == null || !Number.isInteger(parsedJobId) || parsedJobId <= 0;

  useEffect(() => {
    if (isInvalidJobId) return;

    let cancelled = false;

    const fetchResult = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getJobResult(parsedJobId);

        if (!cancelled) {
          setResult(data);
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
  }, [parsedJobId]);

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
      <div className="mt-6">
        {isLoading ? (
          <p className="text-slate-600">Loading result...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : result == null || result.previewRows.length === 0 ? (
          <p className="text-slate-600">No result rows found.</p>
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
    </main>
  );
}
