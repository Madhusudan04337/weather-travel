import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { Input, Select, Switch, Textarea, Button } from "../ui";
import { CityAutocomplete } from "../ui/CityAutocomplete";
import { travelRequestApi } from "../../services/travelRequestApi";
import { TRIP_TYPES, BUDGET_RANGES } from "../../constants/travel-request";
import { TripType, BudgetRange } from "../../types/travel-request";

// Form Schema
const travelRequestSchema = z
  .object({
    destination_city: z.string().min(2, "Destination city is required"),
    travel_date: z
      .string()
      .min(1, "Travel date is required")
      .refine((val) => {
        const date = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      }, "Travel date cannot be in the past")
      .refine((val) => {
        const date = new Date(val);
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        return date <= oneYearFromNow;
      }, "Travel date must be within 12 months"),
    trip_type: z.nativeEnum(TripType, { message: "Trip type is required" }),
    budget_range: z.nativeEnum(BudgetRange, { message: "Budget range is required" }),
    special_needs: z.boolean(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.special_needs && (!data.notes || data.notes.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["notes"],
        message: "Notes are required when special needs are indicated.",
      });
    }
  });

export type TravelRequestFormData = z.infer<typeof travelRequestSchema>;

export interface TravelRequestFormProps {
  mode?: "create" | "edit";
  initialValues?: Partial<TravelRequestFormData> & { id?: string };
  onSuccess?: () => void;
}

export function TravelRequestForm({
  mode = "create",
  initialValues,
  onSuccess,
}: TravelRequestFormProps = {}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const methods = useForm<TravelRequestFormData>({
    resolver: zodResolver(travelRequestSchema),
    defaultValues: initialValues || {
      destination_city: "",
      travel_date: "",
      special_needs: false,
      notes: "",
    },
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
  } = methods;

  // Watch fields for dynamic visibility
  const destinationCity = watch("destination_city");
  const specialNeeds = watch("special_needs");

  const hasDestination = destinationCity && destinationCity.length >= 2;

  // Validate notes when special_needs changes
  useEffect(() => {
    if (hasDestination) {
      trigger("notes");
    }
  }, [specialNeeds, trigger, hasDestination]);

  const mutation = useMutation({
    mutationFn: (data: TravelRequestFormData) => {
      if (mode === "edit" && initialValues?.id) {
        return travelRequestApi.updateTravelRequest(initialValues.id, data);
      }
      return travelRequestApi.createTravelRequest(data);
    },
    onSuccess: () => {
      toast.success(
        mode === "edit"
          ? "Travel request updated successfully."
          : "Travel request created successfully."
      );
      queryClient.invalidateQueries({ queryKey: ["travelRequests"] });
      if (mode === "edit" && initialValues?.id) {
        queryClient.invalidateQueries({ queryKey: ["travelRequest", initialValues.id] });
      }
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/requests");
      }
    },
    onError: (error: any) => {
      console.error(error);
      const detail = error?.response?.data?.detail;
      let errorMsg =
        mode === "edit"
          ? "Unable to update travel request."
          : "Unable to create travel request.";
      if (Array.isArray(detail)) {
        errorMsg = detail.map((e: any) => e.msg).join(", ");
      } else if (typeof detail === "string") {
        errorMsg = detail;
      }
      toast.error(errorMsg);
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <CityAutocomplete
          label="Destination City"
          value={watch("destination_city")}
          onChange={(val) => {
            methods.setValue("destination_city", val, { shouldValidate: true });
          }}
          error={errors.destination_city?.message}
        />

        {hasDestination && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="date"
                label="Travel Date"
                required
                {...register("travel_date")}
                error={errors.travel_date?.message}
              />

              <Select
                label="Trip Type"
                options={[
                  { label: "Select Trip Type", value: "" },
                  ...TRIP_TYPES,
                ]}
                {...register("trip_type")}
                error={errors.trip_type?.message}
              />
            </div>

            <Select
              label="Budget Range"
              options={[
                { label: "Select Budget", value: "" },
                ...BUDGET_RANGES,
              ]}
              {...register("budget_range")}
              error={errors.budget_range?.message}
            />

            <Switch
              label="Special Needs"
              description="Do you require wheelchair access, dietary accommodations, etc.?"
              checked={specialNeeds}
              {...register("special_needs")}
              onChange={(e) => methods.setValue("special_needs", e.target.checked, { shouldValidate: true })}
            />

            {specialNeeds && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Textarea
                  label="Notes"
                  placeholder="Please describe your special needs..."
                  {...register("notes")}
                  error={errors.notes?.message}
                />
              </div>
            )}
          </div>
        )}

        <div className="pt-4 flex justify-end border-t border-border mt-8">
          <Button
            type="submit"
            disabled={!hasDestination || mutation.isPending}
            isLoading={mutation.isPending}
          >
            {mode === "edit" ? "Save Changes" : "Create Request"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
