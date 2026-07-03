import { useState } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { LoadingSkeleton } from "../components/travel/LoadingSkeleton";
import { ErrorState } from "../components/ui/ErrorState";
import { TravelRequestCard } from "../components/travel/TravelRequestCard";
import { RejectModal } from "../components/travel/RejectModal";
import { usePendingApprovals } from "../hooks/usePendingApprovals";
import { useApproveTravelRequest, useRejectTravelRequest } from "../hooks/useTravelRequests";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function ApprovalQueuePage() {
  const { data: requests, isLoading, isError, refetch } = usePendingApprovals();
  const navigate = useNavigate();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [pendingRejectId, setPendingRejectId] = useState<string | null>(null);

  const approveMutation = useApproveTravelRequest();
  const rejectMutation = useRejectTravelRequest();

  const handleApprove = (id: string) => {
    approveMutation.mutate(id, {
      onSuccess: () => toast.success("Request approved successfully."),
      onError: () => toast.error("Failed to approve travel request."),
    });
  };

  const handleRejectClick = (id: string) => {
    setPendingRejectId(id);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = (remarks: string) => {
    if (!pendingRejectId) return;
    rejectMutation.mutate(
      { id: pendingRejectId, remarks: remarks || undefined },
      {
        onSuccess: () => {
          toast.success("Request rejected.");
          setRejectModalOpen(false);
          setPendingRejectId(null);
        },
        onError: () => {
          toast.error("Failed to reject travel request.");
        },
      }
    );
  };

  const handleRejectClose = () => {
    setRejectModalOpen(false);
    setPendingRejectId(null);
  };

  return (
    <>
      <RejectModal
        isOpen={rejectModalOpen}
        onClose={handleRejectClose}
        onConfirm={handleRejectConfirm}
        isLoading={rejectMutation.isPending}
      />

      <div className="flex flex-col gap-8">
        <PageHeader
          title="Approval Queue"
          description="Pending manager approvals for high budget travel requests."
        />

        <div className="flex flex-col gap-4">
          {isLoading && <LoadingSkeleton />}

          {isError && <ErrorState onRetry={() => refetch()} />}

          {!isLoading && !isError && requests.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border p-12 text-center bg-surface">
              <div className="mb-4 text-4xl">✅</div>
              <h3 className="mb-2 text-heading-m font-semibold text-text-primary">
                All caught up!
              </h3>
              <p className="text-body text-text-secondary">
                There are no pending approvals at this time.
              </p>
            </div>
          )}

          {!isLoading && !isError && requests.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {requests.map((request) => (
                <TravelRequestCard
                  key={request.id}
                  request={request}
                  onView={(id) => navigate(`/requests/${id}`)}
                  onApprove={handleApprove}
                  onReject={handleRejectClick}
                  isApprovePending={approveMutation.isPending && approveMutation.variables === request.id}
                  isRejectPending={rejectMutation.isPending && pendingRejectId === request.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
