import { Button } from "../ui/Button";

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border p-12 text-center bg-surface">
      <div className="mb-4 text-4xl">✈️</div>
      <h3 className="mb-2 text-heading-m font-semibold text-text-primary">
        No travel requests yet
      </h3>
      <p className="mb-6 text-body text-text-secondary">
        Create your first weather-aware trip.
      </p>
      <Button onClick={onCreateClick}>Create Request</Button>
    </div>
  );
}
