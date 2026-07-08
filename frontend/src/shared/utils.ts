import type { JobResult, JobStatus, JobStatusValue } from "../types/jobs";

export function parseJobId(jobId: string | undefined) {
  const parsed = Number(jobId);

  if (jobId == null || !Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function getPageTitle(
  isLoading: boolean,
  error: string,
  job: JobStatus | JobResult | null,
) {
  if (isLoading) return "Loading job";
  if (error) return "Unable to load job";
  if (job == null) return "Job not found";

  switch (job.status) {
    case "QUEUED":
      return "Waiting to process";

    case "RUNNING":
      return "Currently processing";

    case "SUCCESS":
      return "Processing complete";

    case "FAILED":
      return "Processing failed";

    case "CANCELLED":
      return "Processing cancelled";

    default:
      return "Job status unknown";
  }
}

export function getStatusDescription(
  status: JobStatusValue,
  numProcessed: number,
  rowCount: number,
) {
  const processedText = numProcessed.toLocaleString("en-US");
  const rowCountText = rowCount.toLocaleString("en-US");

  switch (status) {
    case "SUCCESS":
      return "Processing Completed";

    case "RUNNING":
      if (rowCount > 0) {
        return `${processedText} / ${rowCountText} rows processed`;
      }

      return "Processing file...";

    case "QUEUED":
      return "Queued for processing";

    case "FAILED":
      return "Could not process file";

    case "CANCELLED":
      return "Job was cancelled";

    default:
      return "Unknown job status";
  }
}

export function formatCreatedDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatCount(count: number) {
  return count.toLocaleString("en-US");
}
