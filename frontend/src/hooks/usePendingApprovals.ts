import { useTravelRequests } from "./useTravelRequests";

export function usePendingApprovals() {
  const query = useTravelRequests();

  const pendingRequests = query.data?.data.filter(
    (request) =>
      request.budget_range === "High" &&
      request.approval?.status === "Pending"
  ) || [];

  return {
    ...query,
    data: pendingRequests,
  };
}
