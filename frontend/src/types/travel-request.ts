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
} as const;
export type TravelRequestStatus = typeof TravelRequestStatus[keyof typeof TravelRequestStatus];

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
  trip_type: (typeof TripType)[keyof typeof TripType];
  budget_range: (typeof BudgetRange)[keyof typeof BudgetRange];
  special_needs: boolean;
  notes: string | null;
  status: (typeof TravelRequestStatus)[keyof typeof TravelRequestStatus];
  weather?: WeatherSummary | null;
  recommendation?: Recommendation | null;
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
