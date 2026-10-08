
import api from "./api";

export interface HealthResponse {
  status: string;
  application: string;
  message: string;
}

export async function checkBackendHealth(): Promise<HealthResponse> {
  const response = await api.get<HealthResponse>("/health");
  return response.data;
}