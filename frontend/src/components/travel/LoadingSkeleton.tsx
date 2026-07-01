export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex animate-pulse flex-col gap-4 rounded-card border border-border bg-surface p-6"
        >
          <div className="flex items-center justify-between">
            <div className="h-6 w-1/3 rounded bg-text-muted/20" />
            <div className="h-6 w-24 rounded-full bg-text-muted/20" />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="h-4 w-20 rounded bg-text-muted/20" />
            <div className="h-4 w-24 rounded bg-text-muted/20" />
            <div className="h-4 w-32 rounded bg-text-muted/20" />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <div className="h-8 w-20 rounded bg-text-muted/20" />
            <div className="h-8 w-20 rounded bg-text-muted/20" />
          </div>
        </div>
      ))}
    </div>
  );
}
