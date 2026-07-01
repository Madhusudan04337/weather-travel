import { TripType, BudgetRange } from "../types/travel-request";

export const TRIP_TYPES = [
  { label: "Vacation", value: TripType.VACATION },
  { label: "Business", value: TripType.BUSINESS },
  { label: "Adventure", value: TripType.ADVENTURE },
];

export const BUDGET_RANGES = [
  { label: "Low", value: BudgetRange.LOW },
  { label: "Medium", value: BudgetRange.MEDIUM },
  { label: "High", value: BudgetRange.HIGH },
];
