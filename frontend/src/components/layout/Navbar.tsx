import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import {
  HomeIcon,
  PlusIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

interface NavbarProps {
  isPanelOpen: boolean;
  onTogglePanel: () => void;
}

export function Navbar({ isPanelOpen, onTogglePanel }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isDashboardActive = location.pathname === "/requests" && !location.search.includes("new=true");
  const isNewRequestActive = location.pathname === "/requests" && location.search.includes("new=true");
  const isApprovalActive = location.pathname === "/approval";

  const handleIconClick = (panelName: "dashboard" | "new" | "approval", path: string) => {
    const isActive = 
      (panelName === "dashboard" && isDashboardActive) ||
      (panelName === "new" && isNewRequestActive) ||
      (panelName === "approval" && isApprovalActive);

    if (isActive) {
      onTogglePanel();
    } else {
      navigate(path);
    }
  };

  return (
    <aside className="sticky top-0 z-50 w-16 h-screen flex flex-col items-center justify-between py-4 border-r border-border bg-surface shadow-sm select-none">
      <div className="flex flex-col items-center gap-6 w-full">
        {/* App Logo / Brand Trigger */}
        <Link to="/" className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand/10 text-brand hover:scale-105 transition-transform">
          <span className="font-bold text-body-l">W</span>
        </Link>

        {/* Divider */}
        <div className="w-8 h-[1px] bg-border" />

        {/* Navigation Icons */}
        <nav className="flex flex-col gap-4 w-full items-center">
          {/* Dashboard Link */}
          <button
            onClick={() => handleIconClick("dashboard", "/requests")}
            className={cn(
              "relative group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 cursor-pointer",
              isDashboardActive ? "bg-brand/10 text-brand" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            )}
          >
            {isDashboardActive && (
              <span className="absolute left-0 w-1 h-6 bg-brand rounded-r" />
            )}
            <HomeIcon className="w-6 h-6" />
            {/* Tooltip */}
            <span className="absolute left-14 px-2.5 py-1.5 rounded-lg bg-text-primary text-white text-caption opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none shadow-md z-50 font-medium">
              Dashboard
            </span>
          </button>

          {/* New Request Link */}
          <button
            onClick={() => handleIconClick("new", "/requests?new=true")}
            className={cn(
              "relative group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 cursor-pointer",
              isNewRequestActive ? "bg-brand/10 text-brand" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            )}
          >
            {isNewRequestActive && (
              <span className="absolute left-0 w-1 h-6 bg-brand rounded-r" />
            )}
            <PlusIcon className="w-6 h-6" />
            {/* Tooltip */}
            <span className="absolute left-14 px-2.5 py-1.5 rounded-lg bg-text-primary text-white text-caption opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none shadow-md z-50 font-medium">
              New Request
            </span>
          </button>

          {/* Approval Queue Link */}
          <button
            onClick={() => handleIconClick("approval", "/approval")}
            className={cn(
              "relative group flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 cursor-pointer",
              isApprovalActive ? "bg-brand/10 text-brand" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            )}
          >
            {isApprovalActive && (
              <span className="absolute left-0 w-1 h-6 bg-brand rounded-r" />
            )}
            <ClipboardDocumentCheckIcon className="w-6 h-6" />
            {/* Tooltip */}
            <span className="absolute left-14 px-2.5 py-1.5 rounded-lg bg-text-primary text-white text-caption opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none shadow-md z-50 font-medium">
              Approval Queue
            </span>
          </button>
        </nav>
      </div>

      {/* Footer Element (Optional User Profile or Info Icon) */}
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="w-8 h-[1px] bg-border" />
        <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-caption font-semibold text-text-secondary border border-border">
          JD
        </div>
      </div>
    </aside>
  );
}
