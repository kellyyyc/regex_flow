import type { JobResult } from "../types/jobs";

type JobPreviewTableProps = {
  job: JobResult | null;
};

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
  );
}
