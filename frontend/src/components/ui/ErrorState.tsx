import { Button } from "./Button";

interface ErrorStateProps {
  onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-error/20 bg-error/5 p-12 text-center">
      <div className="mb-4 text-4xl">⚠️</div>
      <h3 className="mb-6 text-body-l font-semibold text-text-primary">
        Something went wrong.
      </h3>
      <Button variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
