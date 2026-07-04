import axios from "axios";
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
  instruction: string;

  regex_pattern: string;
  replacement: string;
  target_columns: string[];

  row_count: number;
  changed_row_count: number;

  column_headers: string[];
  preview_rows: Record<string, string | number | boolean | null>[];

  error_message?: string;
};

export function isNotFoundError(err: unknown) {
  return axios.isAxiosError(err) && err.response?.status === 404;
}

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
    instruction: data.instruction,
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
): Promise<CreateJobResponse | null> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("instruction", instruction);

    const response = await api.post<CreateJobResponseApi>("/jobs/", formData);

    return mapCreateJobResponse(response.data);
  } catch (err) {
    if (isNotFoundError(err)) {
      return null;
    }

    throw err;
  }
};

export const getAllJobs = async (): Promise<JobStatus[] | null> => {
  try {
    const response = await api.get<JobStatusApi[]>("/jobs/");

    return response.data.map(mapJobStatus);
  } catch (err) {
    if (isNotFoundError(err)) {
      return null;
    }

    throw err;
  }
};

export const getJobStatus = async (id: number): Promise<JobStatus | null> => {
  try {
    const response = await api.get<JobStatusApi>(`/jobs/${id}/`);

    return mapJobStatus(response.data);
  } catch (err) {
    if (isNotFoundError(err)) {
      return null;
    }

    throw err;
  }
};

export const getJobResult = async (id: number): Promise<JobResult | null> => {
  try {
    const response = await api.get<JobResultApi>(`/jobs/${id}/result/`);

    return mapJobResult(response.data);
  } catch (err) {
    if (isNotFoundError(err)) {
      return null;
    }

    throw err;
  }
};
