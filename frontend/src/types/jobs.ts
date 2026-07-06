export type JobStatusValue = "QUEUED" | "RUNNING" | "SUCCESS" | "FAILED";

export type CreateJobResponse = {
  id: number;
  fileName: string;
  status: JobStatusValue;
  createdDate: string;
};

export type JobStatus = {
  id: number;
  fileName: string;
  status: JobStatusValue;
  instruction: string;
  createdDate: string;

  numProcessed: number;
  rowCount: number;
};

export type JobResult = {
  id: number;
  fileName: string;
  status: JobStatusValue;
  instruction: string;
  createdDate: string;

  regexPattern: string;
  replacement: string;
  targetColumns: string[];

  rowCount: number;
  changedRowCount: number;

  columnHeaders: string[];
  previewRows: Record<string, string | number | boolean | null>[];

  errorMessage?: string;
};
