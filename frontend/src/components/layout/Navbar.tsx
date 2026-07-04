import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import {
  HomeIcon,
  PlusIcon,
  ClipboardDocumentCheckIcon,
  ListBulletIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isTicketsHovered, setIsTicketsHovered] = useState(false);
  const [forceHideTickets, setForceHideTickets] = useState(false);

  const isDashboardActive = location.pathname.startsWith("/requests") && !location.search.includes("new=true");
  const isNewRequestActive = location.pathname === "/requests" && location.search.includes("new=true");
  const isAllRequestsActive = location.pathname === "/all-requests";
  const isApprovalActive = location.pathname === "/approval";

  const handleIconClick = (path: string) => {
    navigate(path);
  };

  const handleTicketActionClick = (path: string) => {
    navigate(path);
    setIsTicketsHovered(false);
    setForceHideTickets(true);
  };

  const handleTicketsMouseEnter = () => {
    if (!forceHideTickets) setIsTicketsHovered(true);
  };

  const handleTicketsMouseLeave = () => {
    setIsTicketsHovered(false);
    setForceHideTickets(false);
  };

  return (
    <aside className="sticky top-0 z-50 w-16 h-screen hidden md:flex flex-col items-center justify-between py-4 border-r border-border bg-surface shadow-sm select-none">
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
            onClick={() => handleIconClick("/requests")}
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

          {/* Tickets Group (Replaces New and All) */}
          <div 
            className="relative flex items-center justify-center w-12 h-12"
            onMouseEnter={handleTicketsMouseEnter}
            onMouseLeave={handleTicketsMouseLeave}
          >
            <div
              className={cn(
                "flex items-center justify-center w-full h-full rounded-xl transition-all duration-200 cursor-default",
                isNewRequestActive || isAllRequestsActive ? "bg-brand/10 text-brand" : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              )}
            >
              {(isNewRequestActive || isAllRequestsActive) && (
                <span className="absolute left-0 w-1 h-6 bg-brand rounded-r" />
              )}
              <TicketIcon className="w-6 h-6" />
            </div>
            
            {/* Popover Menu */}
            <div 
              className={cn(
                "absolute left-14 top-0 w-48 bg-white border border-border shadow-lg rounded-xl transition-all duration-200 z-50 flex flex-col overflow-hidden",
                isTicketsHovered ? "opacity-100 visible" : "opacity-0 invisible"
              )}
            >
              <div className="px-4 py-2.5 border-b border-border bg-surface/30">
                <h3 className="font-semibold text-text-primary text-[11px] uppercase tracking-wider">Tickets</h3>
              </div>
              <div className="p-1.5 flex flex-col gap-0.5 bg-white">
                <button 
                  onClick={() => handleTicketActionClick("/all-requests")}
                  className="flex items-center gap-3 px-2.5 py-2 text-body-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors w-full text-left"
                >
                  <ListBulletIcon className="w-4 h-4" />
                  List View
                </button>
                <button 
                  onClick={() => handleTicketActionClick("/requests?new=true")}
                  className="flex items-center gap-3 px-2.5 py-2 text-body-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors w-full text-left"
                >
                  <PlusIcon className="w-4 h-4" />
                  New Ticket
                </button>
              </div>
            </div>
          </div>

          {/* Approval Queue Link */}
          <button
            onClick={() => handleIconClick("/approval")}
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
