import type { TravelRequest } from "../../types/travel-request";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";
import { StatusBadge } from "./StatusBadge";

interface TravelRequestCardProps {
  request: TravelRequest;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isApprovePending?: boolean;
  isRejectPending?: boolean;
}

export function TravelRequestCard({
  request,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  isApprovePending,
  isRejectPending,
}: TravelRequestCardProps) {
  const travelDate = new Date(request.travel_date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const requiresApproval = request.budget_range.toLowerCase() === "high";

  return (
    <div className="rounded-card border border-border bg-surface shadow-sm transition-shadow hover:shadow-md flex flex-col h-full">
      <div className="p-4 sm:p-5 flex flex-col gap-4 flex-1">
        {/* Destination & Date */}
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="flex-1 min-w-0">
            <h3 className="text-body-l font-bold text-text-primary flex items-center gap-1.5 truncate">
              <span className="shrink-0">📍</span>
              <span className="truncate">{request.destination_city}</span>
            </h3>
            <p className="text-body-sm text-text-secondary mt-1 flex items-center gap-1.5">
              <span>📅</span> {travelDate}
            </p>
          </div>
        </div>

        {/* Status, Budget, Info Tags */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center flex-wrap gap-2">
            <StatusBadge status={request.status} />
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-secondary bg-surface-hover px-2 py-0.5 rounded border border-border">
              💰 <span className="capitalize">{request.budget_range}</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-1">
            {requiresApproval && request.approval && (
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border",
                request.approval.status === 'Approved' ? "bg-success/10 text-success border-success/20" :
                request.approval.status === 'Rejected' ? "bg-error/10 text-error border-error/20" :
                "bg-warning/10 text-warning border-warning/20"
              )}>
                {request.approval.status === 'Approved' ? "✅ Manager Approved" :
                 request.approval.status === 'Rejected' ? "❌ Manager Rejected" :
                 "⏳ Approval Pending"}
              </span>
            )}
            {!requiresApproval && request.status !== "Closed" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-hover text-text-secondary border border-border">
                ✈️ Auto-Approved
              </span>
            )}
            {request.weather && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-accent/10 text-accent border border-accent/20">
                ☁️ Weather Synced
              </span>
            )}
            {request.status === "Closed" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-brand/10 text-brand border border-brand/20">
                🎉 Fully Fulfilled
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 sm:p-5 pt-0 mt-auto border-t border-border flex flex-wrap items-center gap-2">
        {onApprove && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onApprove(request.id)}
            isLoading={isApprovePending}
            disabled={isApprovePending || isRejectPending}
            className="text-success border-success/30 hover:bg-success/10 hover:text-success hover:border-success"
          >
            Approve
          </Button>
        )}
        {onReject && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReject(request.id)}
            isLoading={isRejectPending}
            disabled={isApprovePending || isRejectPending}
            className="text-error border-error/30 hover:bg-error/10 hover:text-error hover:border-error"
          >
            Reject
          </Button>
        )}
        {onView && (
          <Button variant="ghost" size="sm" onClick={() => onView(request.id)}>
            View
          </Button>
        )}
        {onEdit && request.status === "Pending" && (
          <Button variant="outline" size="sm" onClick={() => onEdit(request.id)}>
            Edit
          </Button>
        )}
        {onDelete && request.status === "Pending" && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(request.id)}
            className="text-error bg-error/10 hover:bg-error/20 hover:text-error"
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
