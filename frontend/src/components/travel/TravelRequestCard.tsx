import type { TravelRequest } from "../../types/travel-request";
import { Button } from "../ui/Button";
import { StatusBadge } from "./StatusBadge";

interface TravelRequestCardProps {
  request: TravelRequest;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TravelRequestCard({
  request,
  onView,
  onEdit,
  onDelete,
}: TravelRequestCardProps) {
  // Format dates
  const travelDate = new Date(request.travel_date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const createdAt = new Date(request.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h3 className="text-heading-m font-bold text-text-primary">
              {request.destination_city}
            </h3>
            <StatusBadge status={request.status} />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-body-sm text-text-secondary">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-text-primary">Date:</span>
              {travelDate}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-text-primary">Type:</span>
              <span className="capitalize">{request.trip_type}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-text-primary">Budget:</span>
              <span className="capitalize">{request.budget_range}</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-muted">
              <span>Created {createdAt}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 md:pt-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView?.(request.id)}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(request.id)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete?.(request.id)}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
