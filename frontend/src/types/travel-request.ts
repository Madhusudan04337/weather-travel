export const TripType = {
  VACATION: "vacation",
  BUSINESS: "business",
  ADVENTURE: "adventure",
} as const;
export type TripType = typeof TripType[keyof typeof TripType];

export const BudgetRange = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;
export type BudgetRange = typeof BudgetRange[keyof typeof BudgetRange];

export const TravelRequestStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;
export type TravelRequestStatus = typeof TravelRequestStatus[keyof typeof TravelRequestStatus];

export interface TravelRequest {
  id: string;
  destination_city: string;
  travel_date: string;
  trip_type: TripType;
  budget_range: BudgetRange;
  special_needs: boolean;
  notes?: string;
  status: TravelRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateTravelRequestRequest {
  destination_city: string;
  travel_date: string;
  trip_type: TripType;
  budget_range: BudgetRange;
  special_needs?: boolean;
  notes?: string | null;
}

export interface UpdateTravelRequestRequest {
  destination_city?: string;
  travel_date?: string;
  trip_type?: TripType;
  budget_range?: BudgetRange;
  special_needs?: boolean;
  notes?: string | null;
}

export interface TravelRequestListResponse {
  total: number;
  skip: number;
  limit: number;
  data: TravelRequest[];
}
