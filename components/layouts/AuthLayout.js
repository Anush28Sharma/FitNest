import Badge from '@/components/common/Badge';
import { ShieldCheck, Activity } from 'lucide-react';

/**
 * Auth Layout - Flat Design Style
 * Using bold color blocking and geometric purity.
 */
export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4 md:p-8 relative overflow-hidden">
      {/* Decorative Geometric Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] rotate-45 bg-accent-secondary/5" />
      
      <div className="w-full max-w-6xl grid md:grid-cols-2 bg-white rounded-lg overflow-hidden border-2 border-border relative z-10">
        {/* Left side - Branding (Poster Style) */}
        <div className="hidden md:flex flex-col justify-between p-16 bg-accent text-white relative">
          {/* Abstract Geometric Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
          
          <div className="relative z-10 space-y-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center">
                <Activity className="text-accent" size={28} strokeWidth={3} />
              </div>
              <span className="font-bold text-3xl tracking-tighter uppercase">FitNest</span>
            </div>
            
            <div className="space-y-6">
              <Badge variant="secondary" className="bg-white text-accent">Secure System</Badge>
              <h2 className="text-6xl font-bold leading-[1] tracking-tight">{title || 'Welcome Back'}</h2>
              <p className="text-white/80 font-medium text-xl max-w-sm leading-snug">
                {subtitle || 'Confident health management through bold digital insights.'}
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-12">
            <div className="flex items-center gap-6">
              <ShieldCheck size={48} strokeWidth={2.5} />
              <div className="h-1 flex-1 bg-white/20" />
            </div>
          </div>
        </div>

        {/* Right side - Content */}
        <div className="p-8 md:p-20 flex flex-col justify-center bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}
