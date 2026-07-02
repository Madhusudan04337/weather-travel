import { PageHeader } from "../components/layout/PageHeader";
import { LoadingSkeleton } from "../components/travel/LoadingSkeleton";
import { ErrorState } from "../components/ui/ErrorState";
import { TravelRequestCard } from "../components/travel/TravelRequestCard";
import { usePendingApprovals } from "../hooks/usePendingApprovals";
import { useNavigate } from "react-router-dom";

export function ApprovalQueuePage() {
  const { data: requests, isLoading, isError, refetch } = usePendingApprovals();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Approval Queue"
        description="Pending manager approvals for high budget travel requests."
      />

      <div className="flex flex-col gap-4">
        {isLoading && <LoadingSkeleton />}
        
        {isError && <ErrorState onRetry={() => refetch()} />}
        
        {!isLoading && !isError && requests.length === 0 && (
          <div className="py-12 text-center text-text-secondary">
            <p className="text-body-m">No pending approvals at this time.</p>
          </div>
        )}
        
        {!isLoading && !isError && requests.length > 0 && (
          <div className="flex flex-col gap-4">
            {requests.map((request) => (
              <TravelRequestCard
                key={request.id}
                request={request}
                onView={(id) => navigate(`/requests/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
