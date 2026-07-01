import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { TravelRequestForm } from "../TravelRequestForm";

// Setup wrapper for hooks
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderForm = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TravelRequestForm />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe("TravelRequestForm", () => {
  it("only shows destination city initially", () => {
    renderForm();
    expect(screen.getByLabelText(/Destination City/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Travel Date/i)).not.toBeInTheDocument();
  });

  it("reveals additional fields when destination city is entered", async () => {
    const user = userEvent.setup();
    renderForm();
    const destInput = screen.getByLabelText(/Destination City/i);
    await user.type(destInput, "Paris");

    await waitFor(() => {
      expect(screen.getByLabelText(/Travel Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Trip Type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Budget Range/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Special Needs/i)).toBeInTheDocument();
    });
  });

  it("reveals notes textarea when special needs is checked", async () => {
    const user = userEvent.setup();
    renderForm();
    const destInput = screen.getByLabelText(/Destination City/i);
    await user.type(destInput, "Paris");

    let specialNeedsSwitch: HTMLElement;
    await waitFor(() => {
      specialNeedsSwitch = screen.getByLabelText(/Special Needs/i);
      expect(specialNeedsSwitch).toBeInTheDocument();
    });

    expect(screen.queryByLabelText(/Notes/i)).not.toBeInTheDocument();

    await user.click(specialNeedsSwitch!);

    await waitFor(() => {
      expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
    });
  });
});
