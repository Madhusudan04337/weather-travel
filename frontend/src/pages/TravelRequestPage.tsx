import { useSearchParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { Card, CardContent } from "../components/ui/Card";
import { ErrorState } from "../components/ui/ErrorState";
import { TravelRequestForm } from "../components/travel/TravelRequestForm";
import { TravelRequestList } from "../components/travel/TravelRequestList";
import { EmptyState } from "../components/travel/EmptyState";
import { LoadingSkeleton } from "../components/travel/LoadingSkeleton";
import { useTravelRequests } from "../hooks/useTravelRequests";
import { TravelRequestStatus } from "../types/travel-request";
import { Button } from "../components/ui/Button";

export function TravelRequestPage() {
  const { data, isLoading, isError, refetch } = useTravelRequests();
  const [searchParams, setSearchParams] = useSearchParams();

  const showForm = searchParams.get("new") === "true";
  const setShowForm = (show: boolean) => {
    if (show) setSearchParams({ new: "true" });
    else setSearchParams({});
  };

  const requests = data?.data || [];

  const stats = {
    total:    requests.length,
    pending:  requests.filter((r) => r.status === TravelRequestStatus.PENDING).length,
    approved: requests.filter((r) => r.status === TravelRequestStatus.APPROVED).length,
    rejected: requests.filter((r) => r.status === TravelRequestStatus.REJECTED).length,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Request Dashboard"
        description="Manage your travel requests and get weather-aware recommendations."
        action={
          !showForm && (
            <Button onClick={() => setShowForm(true)}>New Request</Button>
          )
        }
      />

      {/* ── Stat Cards ── */}
      {!isLoading && !isError && requests.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",    value: stats.total,    color: "text-text-primary" },
            { label: "Pending",  value: stats.pending,  color: "text-accent" },
            { label: "Approved", value: stats.approved, color: "text-success" },
            { label: "Rejected", value: stats.rejected, color: "text-error" },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardContent className="p-4 sm:p-5">
                <p className="text-body-sm font-medium text-text-secondary truncate">{label}</p>
                <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── New Request Form ── */}
      {showForm && (
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-heading-m font-semibold truncate">Create New Request</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="shrink-0">
                Cancel
              </Button>
            </div>
            <TravelRequestForm onSuccess={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      {/* ── Recent Requests ── */}
      <div className="flex flex-col gap-4">
        <h2 className="text-heading-m font-semibold text-text-primary">Recent Requests</h2>
        {isLoading && <LoadingSkeleton />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {!isLoading && !isError && requests.length === 0 && (
          <EmptyState onCreateClick={() => setShowForm(true)} />
        )}
        {!isLoading && !isError && requests.length > 0 && (
          <TravelRequestList requests={requests} />
        )}
      </div>
    </div>
  );
}
