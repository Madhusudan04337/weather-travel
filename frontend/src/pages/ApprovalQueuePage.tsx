import { PageHeader } from "../components/layout/PageHeader";
import { LoadingSkeleton } from "../components/travel/LoadingSkeleton";
import { ErrorState } from "../components/ui/ErrorState";
import { TravelRequestCard } from "../components/travel/TravelRequestCard";
import { usePendingApprovals } from "../hooks/usePendingApprovals";
import { useApproveTravelRequest, useRejectTravelRequest } from "../hooks/useTravelRequests";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function ApprovalQueuePage() {
  const { data: requests, isLoading, isError, refetch } = usePendingApprovals();
  const navigate = useNavigate();

  const approveMutation = useApproveTravelRequest();
  const rejectMutation = useRejectTravelRequest();

  const handleApprove = (id: string) => {
    approveMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Request approved successfully.");
      },
      onError: () => {
        toast.error("Failed to approve travel request.");
      },
    });
  };

  const handleReject = (id: string) => {
    const remarks = window.prompt("Reason for rejection (optional)");
    if (remarks === null) return; // User cancelled prompt

    rejectMutation.mutate(
      { id, remarks: remarks.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("Request rejected successfully.");
        },
        onError: () => {
          toast.error("Failed to reject travel request.");
        },
      }
    );
  };

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
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
