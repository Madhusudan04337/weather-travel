import { useQuery } from "@tanstack/react-query";
import { travelRequestApi } from "../services/travelRequestApi";

export function useTravelRequests(skip = 0, limit = 100) {
  return useQuery({
    queryKey: ["travelRequests", skip, limit],
    queryFn: () => travelRequestApi.getTravelRequests(skip, limit),
  });
}
