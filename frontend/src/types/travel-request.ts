export const TripType = {
  VACATION: "Vacation",
  BUSINESS: "Business",
  ADVENTURE: "Adventure",
} as const;
export type TripType = typeof TripType[keyof typeof TripType];

export const BudgetRange = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
} as const;
export type BudgetRange = typeof BudgetRange[keyof typeof BudgetRange];

export const TravelRequestStatus = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CLOSED: "Closed",
} as const;
export type TravelRequestStatus = typeof TravelRequestStatus[keyof typeof TravelRequestStatus];

export const ApprovalStatus = {
  NOT_REQUIRED: "Not Required",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
} as const;
export type ApprovalStatus = typeof ApprovalStatus[keyof typeof ApprovalStatus];

export interface Approval {
  required: boolean;
  status: ApprovalStatus;
  approver?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  remarks?: string | null;
}

export interface WeatherLocation {
  name: string;
  latitude: number;
  longitude: number;
  country: string | null;
}

export interface WeatherForecast {
  date: string;
  temperature_max: number;
  temperature_min: number;
  precipitation_probability: number;
  weather_code: number;
  weather_description: string;
}

export interface WeatherSummary {
  location: WeatherLocation;
  forecast: WeatherForecast;
}

export interface Recommendation {
  suitable: boolean;
  title: string;
  message: string;
  risk_level: "low" | "medium" | "high";
}

export interface TravelRequest {
  id: string;
  destination_city: string;
  travel_date: string;
  trip_type: TripType;
  budget_range: BudgetRange;
  special_needs: boolean;
  notes: string | null;
  status: TravelRequestStatus;
  weather?: WeatherSummary | null;
  recommendation?: Recommendation | null;
  approval?: Approval | null;
  tasks: FulfillmentTask[];
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

export const TaskStatus = {
  PENDING: "Pending",
  COMPLETED: "Completed",
} as const;
export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export interface FulfillmentTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  completed_at: string | null;
}
