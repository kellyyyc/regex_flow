import { api } from "./client";

import type { CreateJobResponse, JobStatus, JobResult } from "../types/jobs";

export const createProcessingJob = async (
  file: File,
  instruction: string,
): Promise<CreateJobResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("instruction", instruction);

  const response = await api.post<CreateJobResponse>("/jobs/", formData);

  return response.data;
};

export const getJobStatus = async (id: number): Promise<JobStatus> => {
  const response = await api.get<JobStatus>(`/jobs/${id}/`);

  return response.data;
};

export const getJobResult = async (id: number): Promise<JobResult> => {
  const response = await api.get<JobResult>(`/jobs/${id}/result/`);

  return response.data;
};
