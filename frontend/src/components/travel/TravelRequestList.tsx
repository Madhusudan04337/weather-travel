import { TravelRequest } from "../../types/travel-request";
import { TravelRequestCard } from "./TravelRequestCard";

interface TravelRequestListProps {
  requests: TravelRequest[];
}

export function TravelRequestList({ requests }: TravelRequestListProps) {
  return (
    <div className="flex flex-col gap-4">
      {requests.map((request) => (
        <TravelRequestCard
          key={request.id}
          request={request}
          onView={(id) => console.log("View", id)}
          onEdit={(id) => console.log("Edit", id)}
          onDelete={(id) => console.log("Delete", id)}
        />
      ))}
    </div>
  );
}
