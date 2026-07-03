import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";
import { getJobStatus } from "../api/jobs";

import type { JobStatus } from "../types/jobs";

export function JobStatusPage() {
  const { jobId } = useParams();

  const parsedJobId = Number(jobId);
  const isInvalidJobId =
    jobId == null || !Number.isInteger(parsedJobId) || parsedJobId <= 0;

  const [job, setJob] = useState<JobStatus | null>(null);

  useEffect(() => {
    if (isInvalidJobId) return;

    const fetchStatus = async () => {
      const data = await getJobStatus(parsedJobId);
      setJob(data);
    };

    fetchStatus();
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
            <p className="mt-2 text-slate-600">
              Progress: {job?.progress ?? 0}%
            </p>
          </div>

          <span className="w-fit rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-yellow-700">
            {job?.status ?? "WAITING"}
          </span>
        </div>
      </section>
    </main>
  );
}
