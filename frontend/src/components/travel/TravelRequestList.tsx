import type { TravelRequest } from "../../types/travel-request";
import { TravelRequestCard } from "./TravelRequestCard";
import { useNavigate } from "react-router-dom";
import { useDeleteTravelRequest } from "../../hooks/useTravelRequests";
import { toast } from "sonner";

interface TravelRequestListProps {
  requests: TravelRequest[];
  layout?: "grid" | "horizontal";
}

export function TravelRequestList({ requests, layout = "grid" }: TravelRequestListProps) {
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

  if (layout === "horizontal") {
    return (
      <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {requests.map((request) => (
          <div key={request.id} className="min-w-[320px] max-w-[400px] shrink-0 snap-start">
            <TravelRequestCard
              request={request}
              onView={(id) => navigate(`/requests/${id}`)}
              onEdit={(id) => navigate(`/requests/${id}/edit`)}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(360px,1fr))]">
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
