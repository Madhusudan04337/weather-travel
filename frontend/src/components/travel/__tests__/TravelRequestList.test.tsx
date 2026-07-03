import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TravelRequestList } from "../TravelRequestList";
import type {
  TravelRequest,
} from "../../../types/travel-request";
import {
  TravelRequestStatus,
  TripType,
  BudgetRange,
} from "../../../types/travel-request";

const mockRequests: TravelRequest[] = [
  {
    id: "1",
    destination_city: "Paris",
    travel_date: "2026-08-15",
    trip_type: TripType.VACATION,
    budget_range: BudgetRange.HIGH,
    special_needs: false,
    notes: null,
    status: TravelRequestStatus.APPROVED,
    tasks: [],
    created_at: "2026-07-01",
    updated_at: "2026-07-01",
  },
  {
    id: "2",
    destination_city: "London",
    travel_date: "2026-11-15",
    trip_type: TripType.BUSINESS,
    budget_range: BudgetRange.MEDIUM,
    special_needs: true,
    notes: "Requires wheelchair access",
    status: TravelRequestStatus.PENDING,
    tasks: [],
    created_at: "2026-07-02",
    updated_at: "2026-07-02",
  },
];

describe("TravelRequestList", () => {
  it("renders a list of travel request cards", () => {
    render(<TravelRequestList requests={mockRequests} />);

    // Verify destinations are rendered
    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText("London")).toBeInTheDocument();

    // Verify statuses are rendered
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });
});
