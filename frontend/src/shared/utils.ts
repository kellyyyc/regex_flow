import type { JobStatusValue } from "../types/jobs";

export function getStatusClassName(status: JobStatusValue | null) {
  switch (status) {
    case "SUCCESS":
      return "bg-green-100 text-green-700";

    case "FAILED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-orange-100 text-yellow-700";
  }
}

export function getDescription(
  status: JobStatusValue,
  numProcessed: number,
  rowCount: number,
) {
  const processedText = numProcessed.toLocaleString("en-US");
  const rowCountText = rowCount.toLocaleString("en-US");

  switch (status) {
    case "SUCCESS":
      return `Processed all ${rowCountText} rows`;

    case "RUNNING":
      return `Processed ${processedText} of ${rowCountText} rows`;

    case "QUEUED":
      return "Queued for processing";

    case "FAILED":
      return "Could not process file";

    default:
      return "Unknown job status";
  }
}
