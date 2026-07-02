import { Link, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";

export function Navbar() {
  const location = useLocation();
  const isDashboardActive = location.pathname === "/requests" && !location.search.includes("new=true");
  const isNewRequestActive = location.pathname === "/requests" && location.search.includes("new=true");
  const isApprovalActive = location.pathname === "/approval";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-body-l font-bold text-brand">Weather Travel Planner</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/requests"
              className={cn(
                "text-body-sm font-medium transition-colors hover:text-brand",
                isDashboardActive ? "text-brand" : "text-text-secondary"
              )}
            >
              Dashboard
            </Link>
            <Link
              to="/requests?new=true"
              className={cn(
                "text-body-sm font-medium transition-colors hover:text-brand",
                isNewRequestActive ? "text-brand" : "text-text-secondary"
              )}
            >
              New Request
            </Link>
            <Link
              to="/approval"
              className={cn(
                "text-body-sm font-medium transition-colors hover:text-brand",
                isApprovalActive ? "text-brand" : "text-text-secondary"
              )}
            >
              Approval Queue
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
