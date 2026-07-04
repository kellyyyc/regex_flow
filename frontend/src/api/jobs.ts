import { api } from "./client";

import type {
  JobStatusValue,
  CreateJobResponse,
  JobStatus,
  JobResult,
} from "../types/jobs";

type CreateJobResponseApi = {
  id: number;
  file_name: string;
  status: JobStatusValue;
};

type JobStatusApi = {
  id: number;
  file_name: string;
  status: JobStatusValue;
  num_processed: number;
  row_count: number;
};

type JobResultApi = {
  id: number;
  file_name: string;
  status: JobStatusValue;

  regex_pattern: string;
  replacement: string;
  target_columns: string[];

  row_count: number;
  changed_row_count: number;

  column_headers: string[];
  preview_rows: Record<string, string | number | boolean | null>[];

  error_message?: string;
};

function mapCreateJobResponse(data: CreateJobResponseApi): CreateJobResponse {
  return {
    id: data.id,
    fileName: data.file_name,
    status: data.status,
  };
}

function mapJobStatus(data: JobStatusApi): JobStatus {
  return {
    id: data.id,
    fileName: data.file_name,
    status: data.status,
    numProcessed: data.num_processed,
    rowCount: data.row_count,
  };
}

function mapJobResult(data: JobResultApi): JobResult {
  return {
    id: data.id,
    fileName: data.file_name,
    status: data.status,
    regexPattern: data.regex_pattern,
    replacement: data.replacement,
    targetColumns: data.target_columns,
    rowCount: data.row_count,
    changedRowCount: data.changed_row_count,
    columnHeaders: data.column_headers,
    previewRows: data.preview_rows,
    errorMessage: data.error_message,
  };
}

export const createProcessingJob = async (
  file: File,
  instruction: string,
): Promise<CreateJobResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("instruction", instruction);

  const response = await api.post<CreateJobResponseApi>("/jobs/", formData);

  return mapCreateJobResponse(response.data);
};

export const getAllJobs = async (): Promise<JobStatus[]> => {
  const response = await api.get<JobStatusApi[]>("/jobs/");

  return response.data.map(mapJobStatus);
};

export const getJobStatus = async (id: number): Promise<JobStatus> => {
  const response = await api.get<JobStatusApi>(`/jobs/${id}/`);

  return mapJobStatus(response.data);
};

export const getJobResult = async (id: number): Promise<JobResult> => {
  const response = await api.get<JobResultApi>(`/jobs/${id}/result/`);

  return mapJobResult(response.data);
};
