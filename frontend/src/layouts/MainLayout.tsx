import { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { useTravelRequests } from "../hooks/useTravelRequests";
import { usePendingApprovals } from "../hooks/usePendingApprovals";
import { cn } from "../utils/cn";

export function MainLayout() {
  const location = useLocation();

  const { data: requestsData, isLoading: isRequestsLoading } = useTravelRequests();
  const { data: pendingRequests, isLoading: isPendingLoading } = usePendingApprovals();

  const requests = requestsData?.data || [];

  const isNewRequestActive = location.pathname === "/requests" && location.search.includes("new=true");
  const isAllRequestsActive = location.pathname === "/all-requests";
  const isApprovalActive = location.pathname === "/approval";
  const isDashboardActive = location.pathname === "/requests" && !location.search.includes("new=true");
  const isDetailsPage = location.pathname.match(/^\/requests\/[^\/]+$/);

  const getHeaderTitle = () => {
    if (isNewRequestActive) return "New Request";
    if (isAllRequestsActive) return "All Requests";
    if (isApprovalActive) return "Approval Queue";
    if (isDashboardActive) return "Request Dashboard";
    if (isDetailsPage) return "Request Details";
    return "Weather Travel";
  };

  return (
    <div className="relative flex h-screen overflow-hidden flex-row bg-background">
      <Navbar />

      <main className="flex-1 min-h-screen overflow-y-auto bg-background flex flex-col">
        {/* Mobile header - only visible on small screens */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-surface sticky top-0 z-40 shrink-0">
          <Link to="/" className="font-bold text-brand text-body">Weather Travel</Link>
          <nav className="flex items-center gap-4 ml-auto">
            <Link to="/requests" className="text-body-sm text-text-secondary hover:text-brand transition-colors">Dashboard</Link>
            <Link to="/requests?new=true" className="text-body-sm text-text-secondary hover:text-brand transition-colors">New</Link>
            <Link to="/approval" className="text-body-sm text-text-secondary hover:text-brand transition-colors">Approvals</Link>
          </nav>
        </div>
        
        {/* Desktop Header */}
        <header className="hidden md:flex items-center px-8 border-b border-border bg-surface sticky top-0 z-40 h-16 shrink-0">
          <h1 className="text-body-l font-semibold text-text-primary">
            {getHeaderTitle()}
          </h1>
        </header>

        <div className="px-8 py-8 w-full flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
