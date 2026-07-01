import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { TravelRequestPage } from "./pages/TravelRequestPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Redirect home to requests for now since it's our main feature */}
          <Route path="/" element={<Navigate to="/requests" replace />} />
          <Route path="/requests" element={<TravelRequestPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
