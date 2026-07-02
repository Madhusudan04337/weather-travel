import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { travelRequestApi } from "../services/travelRequestApi";

export function useTravelRequests(skip = 0, limit = 100) {
  return useQuery({
    queryKey: ["travelRequests", skip, limit],
    queryFn: () => travelRequestApi.getTravelRequests(skip, limit),
  });
}

export function useDeleteTravelRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => travelRequestApi.deleteTravelRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["travelRequests"] });
    },
  });
}

export function useApproveTravelRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => travelRequestApi.approveTravelRequest(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["travelRequests"] });
      queryClient.invalidateQueries({ queryKey: ["travelRequest", data.id] });
    },
  });
}

export function useRejectTravelRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) =>
      travelRequestApi.rejectTravelRequest(id, remarks),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["travelRequests"] });
      queryClient.invalidateQueries({ queryKey: ["travelRequest", data.id] });
    },
  });
}
