import type { TravelRequest } from "../../types/travel-request";
import { TravelRequestCard } from "./TravelRequestCard";
import { useNavigate } from "react-router-dom";
import { useDeleteTravelRequest } from "../../hooks/useTravelRequests";
import { toast } from "sonner";

interface TravelRequestListProps {
  requests: TravelRequest[];
}

export function TravelRequestList({ requests }: TravelRequestListProps) {
  const deleteMutation = useDeleteTravelRequest();
  const navigate = useNavigate();

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
          onView={(id) => navigate(`/requests/${id}`)}
          onEdit={(id) => navigate(`/requests/${id}/edit`)}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
