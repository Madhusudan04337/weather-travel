import { apiClient } from "./api";

export interface CitySuggestion {
  name: string;
  state: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
}

export const cityApi = {
  searchCities: async (query: string): Promise<CitySuggestion[]> => {
    if (query.length < 3) return [];
    const response = await apiClient.get<CitySuggestion[]>(`/cities/search`, {
      params: { q: query },
    });
    return response.data;
  },
};
