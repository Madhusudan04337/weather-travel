import { apiClient } from "./api";
import type {
  CreateTravelRequestRequest,
  TravelRequest,
  TravelRequestListResponse,
  UpdateTravelRequestRequest,
} from "../types/travel-request";

export const travelRequestApi = {
  createTravelRequest: async (data: CreateTravelRequestRequest): Promise<TravelRequest> => {
    const response = await apiClient.post<TravelRequest>("/requests", data);
    return response.data;
  },

  getTravelRequests: async (skip = 0, limit = 10): Promise<TravelRequestListResponse> => {
    const response = await apiClient.get<TravelRequestListResponse>("/requests", {
      params: { skip, limit },
    });
    return response.data;
  },

  getTravelRequest: async (id: string): Promise<TravelRequest> => {
    const response = await apiClient.get<TravelRequest>(`/requests/${id}`);
    return response.data;
  },

  updateTravelRequest: async (id: string, data: UpdateTravelRequestRequest): Promise<TravelRequest> => {
    const response = await apiClient.patch<TravelRequest>(`/requests/${id}`, data);
    return response.data;
  },

  deleteTravelRequest: async (id: string): Promise<void> => {
    await apiClient.delete(`/requests/${id}`);
  },

  approveTravelRequest: async (id: string): Promise<TravelRequest> => {
    const response = await apiClient.patch<TravelRequest>(`/requests/${id}/approve`);
    return response.data;
  },

  rejectTravelRequest: async (id: string, remarks?: string): Promise<TravelRequest> => {
    const response = await apiClient.patch<TravelRequest>(`/requests/${id}/reject`, { remarks });
    return response.data;
  },
};
