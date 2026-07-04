import { useTravelRequests } from "../hooks/useTravelRequests";
import { TravelRequestList } from "../components/travel/TravelRequestList";
import { LoadingSkeleton } from "../components/travel/LoadingSkeleton";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/travel/EmptyState";
import { useNavigate } from "react-router-dom";

export function AllRequestsPage() {
  const { data, isLoading, isError, refetch } = useTravelRequests();
  const navigate = useNavigate();
  const requests = data?.data || [];

  return (
    <div className="flex flex-col gap-4">
      {isLoading && <LoadingSkeleton />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && !isError && requests.length === 0 && (
        <EmptyState onCreateClick={() => navigate("/requests?new=true")} />
      )}
      {!isLoading && !isError && requests.length > 0 && (
        <TravelRequestList requests={requests} columns={3} />
      )}
    </div>
  );
}
