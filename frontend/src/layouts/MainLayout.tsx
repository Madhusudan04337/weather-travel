import { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { useTravelRequests } from "../hooks/useTravelRequests";
import { usePendingApprovals } from "../hooks/usePendingApprovals";
import { cn } from "../utils/cn";

export function MainLayout() {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const location = useLocation();

  const { data: requestsData, isLoading: isRequestsLoading } = useTravelRequests();
  const { data: pendingRequests, isLoading: isPendingLoading } = usePendingApprovals();

  const requests = requestsData?.data || [];

  const isNewRequestActive = location.pathname === "/requests" && location.search.includes("new=true");
  const isApprovalActive = location.pathname === "/approval";
  const isDashboardActive = location.pathname.startsWith("/requests") && !location.search.includes("new=true");

  return (
    <div className="relative flex h-screen overflow-hidden flex-row bg-background">
      <Navbar isPanelOpen={isPanelOpen} onTogglePanel={() => setIsPanelOpen(!isPanelOpen)} />
      
      {/* VS Code Side Panel */}
      {isPanelOpen && (
        <div className="w-64 h-screen border-r border-border bg-surface flex flex-col select-none animate-in slide-in-from-left duration-200">
          <div className="px-4 border-b border-border h-16 flex items-center justify-between bg-surface/50">
            <span className="font-semibold text-text-primary uppercase tracking-wider text-[11px]">
              {isNewRequestActive ? "New Request" : isApprovalActive ? "Approval Queue" : "Travel Requests"}
            </span>
            <span className="text-[10px] text-text-muted bg-border/40 px-1.5 py-0.5 rounded font-mono">
              {isNewRequestActive ? "Form" : isApprovalActive ? pendingRequests.length : requests.length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
            {isNewRequestActive && (
              <div className="p-3 text-text-secondary text-body-sm leading-relaxed">
                Fill in the form on the right to submit a new travel request. The weather forecast and risk safety assessment will be attached automatically.
              </div>
            )}
            
            {isApprovalActive && (
              <div className="flex flex-col gap-1">
                {isPendingLoading && <div className="p-3 text-caption text-text-muted">Loading approvals...</div>}
                {!isPendingLoading && pendingRequests.length === 0 && (
                  <div className="p-3 text-caption text-text-muted text-center py-8">No pending approvals.</div>
                )}
                {!isPendingLoading && pendingRequests.map(req => (
                  <Link
                    key={req.id}
                    to={`/requests/${req.id}`}
                    className={cn(
                      "p-3 rounded-lg text-body-sm font-medium flex flex-col gap-1 transition-colors border border-transparent",
                      location.pathname === `/requests/${req.id}` 
                        ? "bg-brand/10 text-brand border-brand/10" 
                        : "hover:bg-surface-hover text-text-secondary"
                    )}
                  >
                    <span className="font-semibold text-text-primary flex items-center gap-1.5">
                      <span>📍</span> {req.destination_city}
                    </span>
                    <span className="text-caption text-text-muted pl-5">{new Date(req.travel_date).toLocaleDateString()}</span>
                  </Link>
                ))}
              </div>
            )}

            {isDashboardActive && (
              <div className="flex flex-col gap-1">
                {isRequestsLoading && <div className="p-3 text-caption text-text-muted">Loading requests...</div>}
                {!isRequestsLoading && requests.length === 0 && (
                  <div className="p-3 text-caption text-text-muted text-center py-8">No requests found.</div>
                )}
                {!isRequestsLoading && requests.map(req => (
                  <Link
                    key={req.id}
                    to={`/requests/${req.id}`}
                    className={cn(
                      "p-3 rounded-lg text-body-sm font-medium flex flex-col gap-1 transition-colors border border-transparent",
                      location.pathname === `/requests/${req.id}` 
                        ? "bg-brand/10 text-brand border-brand/10" 
                        : "hover:bg-surface-hover text-text-secondary"
                    )}
                  >
                    <span className="font-semibold text-text-primary flex items-center gap-1.5">
                      <span>📍</span> {req.destination_city}
                    </span>
                    <div className="flex items-center justify-between text-caption text-text-muted mt-1 pl-5">
                      <span>{new Date(req.travel_date).toLocaleDateString()}</span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider",
                        req.status === 'Approved' ? "bg-success/15 text-success" :
                        req.status === 'Rejected' ? "bg-error/15 text-error" :
                        req.status === 'Closed' ? "bg-text-secondary/15 text-text-secondary" :
                        "bg-accent/15 text-accent"
                      )}>
                        {req.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <main className="flex-1 min-h-screen overflow-y-auto bg-background">
        <div className="px-8 py-8 w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
