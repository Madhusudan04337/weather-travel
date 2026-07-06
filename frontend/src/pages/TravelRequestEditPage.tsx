import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { Card, CardContent } from "../components/ui/Card";
import { LoadingSkeleton } from "../components/travel/LoadingSkeleton";
import { ErrorState } from "../components/ui/ErrorState";
import { useTravelRequest } from "../hooks/useTravelRequest";
import { TravelRequestForm } from "../components/travel/TravelRequestForm";
import { Button } from "../components/ui/Button";

export function TravelRequestEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: request, isLoading, isError, refetch } = useTravelRequest(id!);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader title="Loading Request..." />
        <LoadingSkeleton />
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader title="Error" />
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  const initialValues = {
    id: request.id,
    destination_city: request.destination_city,
    travel_date: request.travel_date,
    trip_type: request.trip_type,
    budget_range: request.budget_range,
    special_needs: request.special_needs,
    notes: request.notes || "",
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Edit Travel Request`}
        description={`Editing request to ${request.destination_city}.`}
        action={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        }
      />

      <Card className="max-w-3xl">
        <CardContent className="pt-6">
          <TravelRequestForm
            mode="edit"
            initialValues={initialValues}
            onSuccess={() => navigate(`/requests/${request.id}`, { replace: true })}
            onCancel={() => navigate(-1)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
