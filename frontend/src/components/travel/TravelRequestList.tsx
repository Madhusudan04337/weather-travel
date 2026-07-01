import type { TravelRequest } from "../../types/travel-request";
import { TravelRequestCard } from "./TravelRequestCard";
import { useDeleteTravelRequest } from "../../hooks/useTravelRequests";
import { toast } from "sonner";

interface TravelRequestListProps {
  requests: TravelRequest[];
}

export function TravelRequestList({ requests }: TravelRequestListProps) {
  const deleteMutation = useDeleteTravelRequest();

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this travel request?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success("Travel request deleted successfully.");
        },
        onError: () => {
          toast.error("Failed to delete travel request.");
        },
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {requests.map((request) => (
        <TravelRequestCard
          key={request.id}
          request={request}
          onView={(id) => console.log("View", id)}
          onEdit={(id) => console.log("Edit", id)}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
