import { Outlet, Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTicketsOpen, setIsTicketsOpen] = useState(false);
  const navigate = useNavigate();

  const handleMobileNav = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="relative flex h-screen overflow-hidden flex-row bg-background">
      <Navbar />

      <main className="flex-1 min-h-screen overflow-y-auto bg-background flex flex-col">
        {/* Mobile header - only visible on small screens */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-surface sticky top-0 z-40 shrink-0">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="Weather Travel" className="h-8 w-auto rounded-md object-contain" />
            <span className="font-bold text-brand text-body">Weather Travel</span>
          </Link>
          <button 
            className="text-text-secondary hover:text-text-primary focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu -> Changed to Off-Canvas */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-1000"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Slide-in Sidebar */}
            <div className="relative flex flex-col w-64 max-w-sm h-full bg-surface border-l border-border shadow-2xl animate-in slide-in-from-right-full duration-1000 ease-out">
              <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                <span className="flex items-center gap-2">
                  <img src="/logo.jpeg" alt="Weather Travel" className="h-8 w-auto rounded-md object-contain" />
                  <span className="font-bold text-brand text-body-l">Weather Travel</span>
                </span>
                <button 
                  className="text-text-secondary hover:text-text-primary focus:outline-none p-1 rounded-md hover:bg-surface-hover"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex flex-col p-3 gap-1 overflow-y-auto">
                <button onClick={() => handleMobileNav("/requests")} className="text-left px-4 py-3 text-body-sm font-medium text-text-secondary hover:bg-brand/10 hover:text-brand rounded-xl transition-colors">
                  Dashboard
                </button>
                
                {/* Tickets Accordion */}
                <div className="flex flex-col">
                  <button 
                    onClick={() => setIsTicketsOpen(!isTicketsOpen)} 
                    className="flex items-center justify-between px-4 py-3 text-body-sm font-medium text-text-secondary hover:bg-brand/10 hover:text-brand rounded-xl transition-colors"
                  >
                    <span>Tickets</span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${isTicketsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isTicketsOpen && (
                    <div className="flex flex-col pl-4 pr-2 py-1 gap-1 animate-in slide-in-from-top-2 duration-200">
                      <button onClick={() => handleMobileNav("/all-requests")} className="flex items-center gap-2 text-left px-4 py-2.5 text-body-sm font-medium text-text-secondary hover:bg-brand/10 hover:text-brand rounded-xl transition-colors">
                        List View
                      </button>
                      <button onClick={() => handleMobileNav("/requests?new=true")} className="flex items-center gap-2 text-left px-4 py-2.5 text-body-sm font-medium text-text-secondary hover:bg-brand/10 hover:text-brand rounded-xl transition-colors">
                        New Ticket
                      </button>
                    </div>
                  )}
                </div>

                <button onClick={() => handleMobileNav("/approval")} className="text-left px-4 py-3 text-body-sm font-medium text-text-secondary hover:bg-brand/10 hover:text-brand rounded-xl transition-colors">
                  Approval Queue
                </button>
              </div>
            </div>
          </div>
        )}
        
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
