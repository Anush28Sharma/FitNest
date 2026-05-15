'use client';

import MainNav from './MainNav';

/**
 * Dashboard Layout - Flat Design Style
 * Relying on grid structure and solid color backgrounds.
 */
export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-background relative selection:bg-accent selection:text-white">
      {/* Structural Geometric Background */}
      <div className="absolute inset-0 geometric-bg opacity-50 pointer-events-none" />
      
      <MainNav />
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="animate-fadeIn">
          {children}
        </div>
      </main>

      {/* Decorative Bold Blobs - Solid, not blurred */}
      <div className="fixed bottom-[-100px] left-[-100px] w-64 h-64 bg-accent-secondary opacity-5 rounded-full pointer-events-none" />
      <div className="fixed top-[20%] right-[-50px] w-48 h-48 bg-accent opacity-5 rotate-12 pointer-events-none" />
    </div>
  );
}
