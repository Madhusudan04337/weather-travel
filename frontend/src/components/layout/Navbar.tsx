import { NavLink } from "react-router-dom";
import { cn } from "../../utils/cn";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="text-body-l font-bold text-brand">Weather Travel Planner</span>
          </NavLink>
          <nav className="hidden md:flex items-center gap-6">
            <NavLink
              to="/requests"
              className={({ isActive }) =>
                cn(
                  "text-body-sm font-medium transition-colors hover:text-brand",
                  isActive ? "text-brand" : "text-text-secondary"
                )
              }
            >
              Travel Requests
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-body-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
}
