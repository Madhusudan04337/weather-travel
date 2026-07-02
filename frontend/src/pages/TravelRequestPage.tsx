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
    if (show) {
      setSearchParams({ new: "true" });
    } else {
      setSearchParams({});
    }
  };

  const requests = data?.data || [];
  
  // Compute statistics
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === TravelRequestStatus.PENDING).length,
    approved: requests.filter((r) => r.status === TravelRequestStatus.APPROVED).length,
    rejected: requests.filter((r) => r.status === TravelRequestStatus.REJECTED).length,
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Request Dashboard"
        description="Manage your travel requests and get weather-aware recommendations."
        action={
          !showForm && (
            <Button onClick={() => setShowForm(true)}>New Request</Button>
          )
        }
      />

      {/* Statistics Section */}
      {!isLoading && !isError && requests.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="bg-surface">
            <CardContent className="p-6">
              <div className="text-body-sm font-medium text-text-secondary">Total Requests</div>
              <div className="mt-2 text-heading-l font-bold text-text-primary">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-surface">
            <CardContent className="p-6">
              <div className="text-body-sm font-medium text-text-secondary">Pending</div>
              <div className="mt-2 text-heading-l font-bold text-accent">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="bg-surface">
            <CardContent className="p-6">
              <div className="text-body-sm font-medium text-text-secondary">Approved</div>
              <div className="mt-2 text-heading-l font-bold text-success">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card className="bg-surface">
            <CardContent className="p-6">
              <div className="text-body-sm font-medium text-text-secondary">Rejected</div>
              <div className="mt-2 text-heading-l font-bold text-error">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Travel Request Form */}
      {showForm && (
        <Card className="max-w-3xl">
          <CardContent className="pt-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-heading-m font-semibold">Create New Request</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
            <TravelRequestForm onSuccess={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      {/* Recent Requests Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-heading-m font-semibold text-text-primary">
          Recent Requests
        </h2>
        
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
