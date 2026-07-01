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
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-card-title font-bold text-text-primary">
              {request.destination_city}
            </h3>
            <p className="text-small text-text-secondary mt-1">
              {travelDate} • {request.trip_type}
            </p>
          </div>
          <StatusBadge status={request.status} />
        </div>
        
        {/* Recommendation & Weather Section */}
        {request.weather && request.recommendation && (
          <div className="mt-4 p-3 rounded-lg bg-background border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-small text-text-primary">
                {request.weather.forecast.weather_description}
              </span>
              <RiskBadge riskLevel={request.recommendation.risk_level} />
            </div>
            <p className="text-caption text-text-secondary">
              {request.recommendation.message}
            </p>
            <div className="mt-2 text-caption text-text-muted flex gap-3">
              <span>{request.weather.forecast.temperature_min}°C - {request.weather.forecast.temperature_max}°C</span>
              <span>Precipitation: {request.weather.forecast.precipitation_probability}%</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-body-sm text-text-secondary">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-text-primary">Budget:</span>
            <span className="capitalize">{request.budget_range}</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-muted">
            <span>Created {createdAt}</span>
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

// ── Internal RiskBadge Component ─────────────────────────────────────────────

function RiskBadge({ riskLevel }: { riskLevel: "low" | "medium" | "high" }) {
  let styles = "";
  let icon = "";
  let label = "";

  switch (riskLevel) {
    case "low":
      styles = "bg-success/10 text-success border-success/20";
      icon = "🟢";
      label = "Low Risk";
      break;
    case "medium":
      styles = "bg-warning/10 text-warning border-warning/20";
      icon = "🟡";
      label = "Medium Risk";
      break;
    case "high":
      styles = "bg-error/10 text-error border-error/20";
      icon = "🔴";
      label = "High Risk";
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption font-medium border ${styles}`}>
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
}
