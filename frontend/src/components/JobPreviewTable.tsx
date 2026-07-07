import type { JobResult } from "../types/jobs";
import { formatCreatedDate } from "../shared/utils";

type JobPreviewTableProps = {
  job: JobResult | null;
};

const formatCount = (count: number) => count.toLocaleString("en-US");

export function JobPreviewTable({ job }: JobPreviewTableProps) {
  if (job == null) {
    return;
  }

  const getNoPreviewRowsText = () => {
    if (job.status === "SUCCESS") {
      return "No preview rows were generated for this job.";
    } else {
      return "Preview rows are not available yet. Check back after processing completes.";
    }
  };

  return (
    <div className="space-y-6">
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
            {job.replacement || "Not available."}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-sm font-medium text-slate-500">Rows Changed</dt>
          <dd className="mt-1 text-sm text-slate-900">
            {formatCount(job.changedRowCount)} of {formatCount(job.rowCount)}{" "}
            rows changed
          </dd>
        </div>
      </dl>

      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
        {job.previewRows.length > 0 ? (
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Preview Rows
              </h2>
              <p className="text-sm text-slate-600">
                Sample rows from the processed result.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr>
                    {job.columnHeaders.map((column) => (
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
                  {job.previewRows.map((row, index) => (
                    <tr key={index}>
                      {job.columnHeaders.map((column) => (
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
          </div>
        ) : (
          getNoPreviewRowsText()
        )}
      </div>
    </div>
  );
}
