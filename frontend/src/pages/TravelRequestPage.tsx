import { PageHeader } from "../components/layout/PageHeader";
import { Card, CardContent } from "../components/ui";
import { TravelRequestForm } from "../components/forms/TravelRequestForm";

export function TravelRequestPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New Travel Request"
        description="Plan your next trip with weather-aware recommendations."
      />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <TravelRequestForm />
        </CardContent>
      </Card>
    </div>
  );
}
