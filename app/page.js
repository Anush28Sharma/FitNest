'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { Activity, Shield, Zap, ArrowRight, Brain, Smartphone, Users, ChevronRight } from 'lucide-react';
import MainNav from '@/components/layouts/MainNav';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isSimulating = false; // Added to fix ReferenceError

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-16 h-16 border-8 border-muted border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <MainNav />
      
      {/* Hero Section - Bold Blue Poster Style */}
      <section className="relative pt-24 pb-20 md:pt-36 md:pb-28 bg-accent text-white overflow-hidden">
        {/* Geometric Decorations */}
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-white/5 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-10 left-10 w-32 h-32 rotate-45 border-8 border-white/10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-[1fr_450px] gap-16 items-center">
            <div className="space-y-10">
              <div className="flex">
                <Badge variant="outline" className="bg-white border-none !text-blue-600">AI-Powered Analytics</Badge>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[0.9]">
                PREDICT <br />
                YOUR <br />
                HEALTH.
              </h1>
              <p className="text-white/80 text-lg md:text-xl font-medium max-w-xl leading-snug">
                FitNest uses AI-powered health simulations to help you visualize and achieve your perfect physical state. Confident, bold, and easy to use.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href={user ? "/dashboard" : "/register"}>
                  <Button size="lg" className="bg-white !text-blue-600 hover:bg-gray-100 hover:scale-105 border-none">
                    {user ? "Go to Dashboard" : "Start Now"}
                    <ArrowRight size={24} className="ml-2" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-accent">
                    Explore Tech
                  </Button>
                </Link>
              </div>
            </div>

            {/* Geometric Hero Composition */}
            <div className="hidden lg:block relative aspect-square">
              <div className="absolute inset-0 bg-white/10 rounded-lg rotate-3" />
              <div className="absolute inset-0 bg-white/10 rounded-lg -rotate-3" />
              <div className="absolute inset-0 bg-white rounded-lg flex flex-col items-center justify-center p-12 space-y-6 shadow-none">
                <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-white">
                  <Activity size={48} strokeWidth={3} />
                </div>
                {/* Status Indicator */}
                <div className="absolute top-6 left-6 flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${isSimulating ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    {isSimulating ? 'Analysing...' : 'Ready'}
                  </span>
                </div>

                {/* HEALTH STATUS */}
                <div className="relative flex items-center justify-center w-40 h-40 md:w-52 md:h-52 mb-6 z-10">
                  <div className="text-accent text-center space-y-2">
                    <div className="text-4xl font-black">98.4%</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Accuracy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Removed Stats Section */}

      {/* Features Section - Bold Color Blocks */}
      <section id="features" className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 mb-20">
            <Badge variant="primary">Core System</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground max-w-4xl">
              ADVANCED <br />
              <span className="text-accent">INSIGHTS.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Brain,
                title: 'Health Modeling',
                desc: 'Run what-if scenarios on your health data to visualize future outcomes instantly.',
                color: 'bg-blue-50 text-accent',
                hover: 'hover:bg-blue-100'
              },
              {
                icon: Zap,
                title: 'Quick Feedback',
                desc: 'Real-time feedback that adjusts your health score as you log data.',
                color: 'bg-amber-50 text-amber-600',
                hover: 'hover:bg-amber-100'
              },
              {
                icon: Smartphone,
                title: 'Simple Design',
                desc: 'Optimized interfaces that feel direct and snappy on every platform.',
                color: 'bg-gray-100 text-gray-700',
                hover: 'hover:bg-gray-200'
              },
              {
                icon: Activity,
                title: 'Health Data',
                desc: 'Comprehensive tracking of blood pressure, heart rate, and health logs.',
                color: 'bg-red-50 text-red-600',
                hover: 'hover:bg-red-100'
              },
            ].map((feature, i) => (
              <div key={i} className={`group p-8 ${feature.color} ${feature.hover} rounded-lg transition-all duration-200 card-hover space-y-6`}>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-none border-2 border-current">
                  <feature.icon size={32} strokeWidth={2.5} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold uppercase tracking-tight">{feature.title}</h3>
                  <p className="text-current/70 text-base font-medium leading-snug">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - Full Color Block */}
      <section className="bg-emerald-500 text-white py-24 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mt-48" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-16">
          <div className="space-y-8 max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold leading-[0.9] tracking-tighter">
              BETTER <br />
              HEALTH <br />
              DECISIONS.
            </h2>
            <p className="text-white/80 text-xl font-medium leading-snug">
              Stop guessing. Use clear data to make the right moves for your body.
            </p>
          </div>
          <div className="w-full md:w-auto">
            <Link href="/register">
              <Button size="lg" className="bg-white !text-emerald-600 hover:bg-gray-100 px-10 h-16 text-lg border-none">
                Create Account
                <ChevronRight size={24} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Minimalist Flat */}
      <footer className="py-16 bg-white border-t-4 border-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="space-y-4">
              <div className="font-bold text-3xl tracking-tighter uppercase">FitNest</div>
              <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">
                Made by Sakshham Bhagat, Ujjwal Dalal, Anush Sharma
              </p>
            </div>
            
            <div className="flex items-center gap-8">
              <Link 
                href="https://github.com/SakshhamTheCoder/fitnest-ucs662" 
                target="_blank"
                className="text-xs font-black uppercase tracking-[0.2em] text-accent hover:underline"
              >
                GitHub Repository
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
