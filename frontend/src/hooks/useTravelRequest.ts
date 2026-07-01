import { useQuery } from "@tanstack/react-query";
import { travelRequestApi } from "../services/travelRequestApi";

export function useTravelRequest(id: string) {
  return useQuery({
    queryKey: ["travelRequest", id],
    queryFn: () => travelRequestApi.getTravelRequest(id),
    enabled: !!id,
  });
}
