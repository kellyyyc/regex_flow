import { formatCreatedDate } from "../shared/utils";

import type { ReactNode } from "react";
import type { JobResult, JobStatus } from "../types/jobs";

type JobInfoSectionProps = {
  job: JobStatus | JobResult | null;
  children?: ReactNode;
};
export function JobInfoSection({ job, children }: JobInfoSectionProps) {
  if (job == null) {
    return;
  }

  return (
    <dl className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <dt className="text-sm font-medium text-slate-500">Created Date</dt>
        <dd className="mt-1 text-sm text-slate-900">
          {formatCreatedDate(job.createdDate)}
        </dd>
      </div>
      <div className="sm:col-span-2">
        <dt className="text-sm font-medium text-slate-500">File Name</dt>
        <dd className="mt-1 text-sm text-slate-900">{job.fileName}</dd>
      </div>
      <div className="sm:col-span-2">
        <dt className="text-sm font-medium text-slate-500">
          User Input - Natural Language
        </dt>
        <dd className="mt-1 text-sm text-slate-900">{job.instruction}</dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-slate-500">
          LLM Output - Regex Pattern
        </dt>
        <dd className="mt-1 break-all rounded-lg bg-white px-3 py-2 font-mono text-sm text-slate-900">
          {job.regexPattern || "Not available."}
        </dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-slate-500">
          Replacement Value
        </dt>
        <dd className="mt-1 rounded-lg bg-white px-3 py-2 font-mono text-sm text-slate-900">
          {job.replacement != null ? `"${job.replacement}"` : "Not available."}
        </dd>
      </div>
      <div className="sm:col-span-2">
        <dt className="text-sm font-medium text-slate-500">Target Columns</dt>
        <dd className="mt-1 break-all rounded-lg bg-white px-3 py-2 font-mono text-sm text-slate-900">
          {job.targetColumns.length > 0
            ? job.targetColumns.join(", ")
            : "Not available."}
        </dd>
      </div>

      {children}
    </dl>
  );
}
