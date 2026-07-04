import { Outlet, Link } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";

export function MainLayout() {
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
        
        <header className="hidden md:flex items-center justify-end px-8 border-b border-border bg-surface sticky top-0 z-40 h-16 shrink-0">
          <div className="flex items-center gap-4 shrink-0">
            {/* Search Bar */}
            <div className="relative w-64 mr-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">🔍</span>
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-9 pr-4 py-1.5 bg-background border border-border rounded-lg text-body-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              />
            </div>
            
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover text-text-secondary transition-colors">
              🔔
            </button>
            <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-bold text-caption">
              MS
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] px-8 py-8 w-full flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
