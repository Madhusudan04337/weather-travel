import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { MainLayout } from "./layouts/MainLayout";
import { TravelRequestPage } from "./pages/TravelRequestPage";
import { TravelRequestDetailsPage } from "./pages/TravelRequestDetailsPage";
import { TravelRequestEditPage } from "./pages/TravelRequestEditPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            {/* Redirect home to requests for now since it's our main feature */}
            <Route path="/" element={<Navigate to="/requests" replace />} />
            <Route path="/requests" element={<TravelRequestPage />} />
            <Route path="/requests/:id" element={<TravelRequestDetailsPage />} />
            <Route path="/requests/:id/edit" element={<TravelRequestEditPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

export default App;
