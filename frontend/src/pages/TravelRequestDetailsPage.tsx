import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { LoadingSkeleton } from "../components/travel/LoadingSkeleton";
import { ErrorState } from "../components/ui/ErrorState";
import { useTravelRequest } from "../hooks/useTravelRequest";
import { StatusBadge } from "../components/travel/StatusBadge";

export function TravelRequestDetailsPage() {
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

  const travelDate = new Date(request.travel_date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const createdAt = new Date(request.created_at).toLocaleString();
  const updatedAt = new Date(request.updated_at).toLocaleString();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`Travel to ${request.destination_city}`}
        description="Detailed view of the travel request."
        action={
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back to Dashboard
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-heading-m font-semibold">Request Details</h2>
              <StatusBadge status={request.status} />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-caption font-medium text-text-secondary">Destination</div>
                <div className="text-body text-text-primary mt-1">{request.destination_city}</div>
              </div>
              <div>
                <div className="text-caption font-medium text-text-secondary">Travel Date</div>
                <div className="text-body text-text-primary mt-1">{travelDate}</div>
              </div>
              <div>
                <div className="text-caption font-medium text-text-secondary">Trip Type</div>
                <div className="text-body text-text-primary mt-1 capitalize">{request.trip_type}</div>
              </div>
              <div>
                <div className="text-caption font-medium text-text-secondary">Budget Range</div>
                <div className="text-body text-text-primary mt-1 capitalize">{request.budget_range}</div>
              </div>
            </div>

            <div className="mt-2">
              <div className="text-caption font-medium text-text-secondary">Special Needs</div>
              <div className="text-body text-text-primary mt-1">
                {request.special_needs ? "Yes" : "No"}
              </div>
            </div>

            {request.notes && (
              <div className="mt-2">
                <div className="text-caption font-medium text-text-secondary">Notes</div>
                <div className="text-body text-text-primary mt-1 whitespace-pre-wrap">
                  {request.notes}
                </div>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
              <div>
                <div className="text-caption font-medium text-text-secondary">Created At</div>
                <div className="text-small text-text-muted mt-1">{createdAt}</div>
              </div>
              <div>
                <div className="text-caption font-medium text-text-secondary">Last Updated</div>
                <div className="text-small text-text-muted mt-1">{updatedAt}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar: Weather & Recommendations */}
        <div className="flex flex-col gap-6">
          {request.weather && (
            <Card>
              <CardHeader>
                <h3 className="text-heading-s font-semibold">☀️ Weather</h3>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="text-body font-medium text-text-primary">
                  {request.weather.forecast.weather_description}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <div className="text-caption font-medium text-text-secondary">🌡️ Temp</div>
                    <div className="text-small text-text-primary mt-1">
                      {request.weather.forecast.temperature_max}°C / {request.weather.forecast.temperature_min}°C
                    </div>
                  </div>
                  <div>
                    <div className="text-caption font-medium text-text-secondary">🌧 Rain Prob</div>
                    <div className="text-small text-text-primary mt-1">
                      {request.weather.forecast.precipitation_probability}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {request.recommendation && (
            <Card>
              <CardHeader>
                <h3 className="text-heading-s font-semibold">💡 Recommendation</h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption font-medium border ${
                    request.recommendation.risk_level === 'low' ? 'bg-success/10 text-success border-success/20' :
                    request.recommendation.risk_level === 'medium' ? 'bg-warning/10 text-warning border-warning/20' :
                    'bg-error/10 text-error border-error/20'
                  }`}>
                    {request.recommendation.risk_level === 'low' ? '🟢 Low Risk' :
                     request.recommendation.risk_level === 'medium' ? '🟡 Medium Risk' :
                     '🔴 High Risk'}
                  </span>
                </div>
                <div className="text-small text-text-primary mt-2">
                  {request.recommendation.message}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
