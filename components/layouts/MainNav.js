'use client'
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from '../common/Button';
import { useState, useEffect } from 'react';
import { Menu, X, Home, Calculator, User, LogOut, Activity, Sparkles, Pill } from 'lucide-react';

/**
 * Main Navigation Component - Flat Design Style
 * High contrast, bold colors, and zero artificial depth.
 */
export default function MainNav() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => pathname === path;

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/health/log', label: 'Health Log', icon: Activity },
    { href: '/simulator', label: 'AI Simulator', icon: Sparkles },
    { href: '/medications', label: 'Medications', icon: Pill },
    { href: '/bmi', label: 'BMI Calculator', icon: Calculator },
    { href: '/me', label: 'Profile', icon: User },
  ];

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled ? 'bg-white border-b-4 border-muted py-1.5' : 'bg-transparent py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link 
              id="nav-logo"
              href="/dashboard" 
              className="flex items-center gap-2 group"
            >
              <div className="w-10 h-10 bg-accent rounded-md flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                <Activity className="w-5 h-5 text-white" strokeWidth={3} />
              </div>
              <span className={`text-xl font-bold tracking-tighter uppercase transition-colors duration-200 ${scrolled || pathname === '/' ? 'text-foreground' : 'text-foreground'}`}>
                FitNest
              </span>
            </Link>

            {user && (
              <>
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-2">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        id={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                        href={link.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ${
                          isActive(link.href)
                            ? 'bg-accent text-white'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className="w-4 h-4" strokeWidth={2.5} />
                        {link.label}
                      </Link>
                    );
                  })}
                  
                  {/* Desktop Logout */}
                  <div className="ml-4 pl-4 border-l-2 border-muted">
                    <button
                      id="nav-logout-desktop"
                      onClick={handleLogout}
                      disabled={loading}
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
                    >
                      <LogOut className="w-4 h-4" strokeWidth={2.5} />
                      Logout
                    </button>
                  </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                  id="nav-mobile-toggle"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-3 rounded-md bg-muted text-foreground transition-all duration-200 hover:scale-105"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <X className="w-6 h-6" strokeWidth={3} />
                  ) : (
                    <Menu className="w-6 h-6" strokeWidth={3} />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Slide-down */}
      {user && (
        <div 
          className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
            mobileMenuOpen ? 'visible' : 'invisible pointer-events-none'
          }`}
        >
          {/* Overlay - High Contrast Flat */}
          <div 
            className={`absolute inset-0 bg-foreground/40 transition-opacity duration-300 ${
              mobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu - Solid Block */}
          <div 
            className={`absolute right-4 top-24 w-80 bg-white rounded-lg border-4 border-foreground transition-all duration-200 transform ${
              mobileMenuOpen ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'
            }`}
          >
            <div className="p-8 space-y-8">
              {/* User Info */}
              <div className="pb-8 border-b-2 border-muted">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-accent-secondary rounded-md flex items-center justify-center text-white font-bold text-2xl">
                    {user.name?.charAt(0) || user.username?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-lg font-bold uppercase tracking-tight text-foreground">{user.name || user.username}</p>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">@{user.username}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      id={`nav-mobile-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-5 py-4 rounded-md text-xs font-bold uppercase tracking-[0.2em] transition-all duration-200 ${
                        isActive(link.href)
                          ? 'bg-accent text-white'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-5 h-5" strokeWidth={2.5} />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <div className="pt-8 border-t-2 border-muted">
                <button
                  id="nav-logout-mobile"
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-md text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 border-2 border-red-500/20 transition-all duration-200 disabled:opacity-50"
                >
                  <LogOut className="w-5 h-5" strokeWidth={2.5} />
                  {loading ? 'Processing...' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
