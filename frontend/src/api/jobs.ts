import axios from "axios";
import { api } from "./client";

import type { CreateJobResponse, JobStatus, JobResult } from "../types/jobs";

export function isNotFoundError(err: unknown) {
  return axios.isAxiosError(err) && err.response?.status === 404;
}

export const createProcessingJob = async (
  file: File,
  instruction: string,
): Promise<CreateJobResponse | null> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("instruction", instruction);

    const response = await api.post<CreateJobResponse>("/jobs/", formData);

    return response.data;
  } catch (err) {
    if (isNotFoundError(err)) {
      return null;
    }

    throw err;
  }
};

export const getAllJobs = async (): Promise<JobStatus[] | null> => {
  try {
    const response = await api.get<JobStatus[]>("/jobs/");

    return response.data;
  } catch (err) {
    if (isNotFoundError(err)) {
      return null;
    }

    throw err;
  }
};

export const getJobStatus = async (id: number): Promise<JobStatus | null> => {
  try {
    const response = await api.get<JobStatus>(`/jobs/${id}/`);

    return response.data;
  } catch (err) {
    if (isNotFoundError(err)) {
      return null;
    }

    throw err;
  }
};

export const getJobResult = async (id: number): Promise<JobResult | null> => {
  try {
    const response = await api.get<JobResult>(`/jobs/${id}/result/`);

    return response.data;
  } catch (err) {
    if (isNotFoundError(err)) {
      return null;
    }

    throw err;
  }
};
