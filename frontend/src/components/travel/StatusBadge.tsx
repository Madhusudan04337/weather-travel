import { Badge } from "../ui";
import { TravelRequestStatus } from "../../types/travel-request";

interface StatusBadgeProps {
  status: TravelRequestStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  // Map backend status to UI badge variants
  const statusToVariantMap: Record<TravelRequestStatus, React.ComponentProps<typeof Badge>["variant"]> = {
    [TravelRequestStatus.PENDING]: "pending",
    [TravelRequestStatus.APPROVED]: "approved",
    [TravelRequestStatus.REJECTED]: "rejected",
  };

  const labels: Record<TravelRequestStatus, string> = {
    [TravelRequestStatus.PENDING]: "Pending",
    [TravelRequestStatus.APPROVED]: "Approved",
    [TravelRequestStatus.REJECTED]: "Rejected",
  };

  return (
    <Badge variant={statusToVariantMap[status]}>
      {labels[status]}
    </Badge>
  );
}
