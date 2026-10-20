import { api } from "./api";

export interface HealthResponse {
  status: string;
  [key: string]: unknown;
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await api.get<HealthResponse>("/health");
  return response.data;
}

export const checkHealth = getHealth;
export const getHealthStatus = getHealth;

export default getHealth;