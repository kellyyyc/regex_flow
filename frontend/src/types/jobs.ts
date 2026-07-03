export type CreateJobResponse = {
  job_id: number;
  status: string;
};

export type JobStatus = {
  id: number;
  status: string;
  progress: number;
};

export type JobResult = {
  jobId: number;
  originalFileName: string;
  status: string;

  regexPattern: string;
  replacement: string;
  targetColumns: string[];

  rowCount: number;
  changedRowCount: number;

  columnHeaders: string[];
  previewRows: Record<string, string | number | boolean | null>[];

  errorMessage?: string;
};
