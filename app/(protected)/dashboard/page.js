'use client';

import LoadingSpinner from '@/components/common/LoadingSpinner';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import HealthCharts from '@/components/dashboard/HealthCharts';
import AIRecommendations from '@/components/dashboard/AIRecommendations';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Link from 'next/link';
import { Activity, Plus, LayoutGrid, ChevronRight, User, ArrowUpRight, Pill } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading || !user) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <LoadingSpinner size="xl" />
        </div>
      </DashboardLayout>
    );
  }

  const profileFields = [user.name, user.email, user.mobile, user.username, user.dateOfBirth, user.gender];
  const filledFields = profileFields.filter((f) => f && f !== '-').length;
  const profileCompletion = Math.round((filledFields / profileFields.length) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-12 animate-fadeIn">
        
        {/* Welcome Section - Bold Blue Poster Block */}
        <section className="bg-accent text-white rounded-lg overflow-hidden relative">
          <div className="absolute inset-0 geometric-bg opacity-10 pointer-events-none" />
          <div className="relative z-10 p-10 md:p-14">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                {/* Avatar */}
                <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-full flex items-center justify-center text-4xl font-black text-accent border-4 border-white/20 flex-shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.username?.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-4">
                  <div className="flex justify-center md:justify-start">
                    <Badge variant="secondary" className="bg-white text-accent">Active Session</Badge>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase leading-[0.85]">
                    WELCOME BACK, <br />
                    <span className="text-white/40">{user.name?.split(' ')[0] || user.username}</span>
                  </h1>
                  <p className="text-white/80 font-medium text-base uppercase tracking-[0.2em]">
                    Health data updated.
                  </p>
                </div>
              </div>
              <div className="bg-white text-accent p-6 rounded-md text-center border-b-8 border-blue-600 min-w-[180px]">
                <div className="text-[10px] font-black uppercase tracking-widest mb-1">Profile Setup</div>
                <div className="text-4xl font-black">{profileCompletion}%</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                  {profileCompletion === 100 ? 'Complete' : 'Action Needed'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            onClick={() => router.push('/health/log')}
            className="group relative overflow-hidden bg-foreground rounded-lg p-10 cursor-pointer transition-all duration-200 hover:scale-105"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 bg-white text-foreground rounded-md flex items-center justify-center">
                <Plus size={32} strokeWidth={3} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-white uppercase tracking-tight leading-none">Record <br /> Vitals</h3>
                <p className="text-white/50 font-medium text-lg leading-snug">Update your daily health details.</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => router.push('/simulator')}
            className="group relative overflow-hidden bg-accent-secondary rounded-lg p-10 cursor-pointer transition-all duration-200 hover:scale-105"
          >
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rotate-45 -ml-16 -mb-16 group-hover:rotate-90 transition-transform duration-500" />
            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 bg-white text-accent-secondary rounded-md flex items-center justify-center">
                <LayoutGrid size={32} strokeWidth={3} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-white uppercase tracking-tight leading-none">AI <br /> Simulator</h3>
                <p className="text-white/60 font-medium text-lg leading-snug">Visualize what-if health outcomes.</p>
              </div>
            </div>
          </div>
          <div 
            onClick={() => router.push('/medications')}
            className="group relative overflow-hidden bg-purple-600 rounded-lg p-10 cursor-pointer transition-all duration-200 hover:scale-105"
          >
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rotate-45 -mr-16 -mb-16 group-hover:rotate-90 transition-transform duration-500" />
            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 bg-white text-purple-600 rounded-md flex items-center justify-center">
                <Pill size={32} strokeWidth={3} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-white uppercase tracking-tight leading-none">Pill <br /> Manager</h3>
                <p className="text-white/60 font-medium text-lg leading-snug">Track daily prescriptions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
          {/* Left Column: Data & Analytics */}
          <div className="space-y-12">
            <HealthCharts data={[...(user.healthHistory || []), ...(user.bmiHistory || [])]} />
            <AIRecommendations user={user} />
          </div>

          {/* Right Column: Status & History */}
          <div className="space-y-12">
            {/* Status Section */}
            <section className="space-y-8">
              <div className="space-y-2">
                <Badge variant="muted">Health Status</Badge>
                <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground">Current Status</h2>
              </div>
              
              <div className="space-y-6">
                {/* Health Status Card */}
                {(() => {
                  const entries = user.healthHistory ? user.healthHistory.filter(h => h.status) : [];
                  const latest = entries.length > 0 ? entries[entries.length - 1] : null;
                  
                  const getRiskStatus = (record) => {
                    if (!record) return { label: 'NO DATA', color: 'bg-white', text: 'text-foreground' };
                    
                    const sys = Number(record.systolicBp);
                    const dia = Number(record.diastolicBp) || 80;
                    const hr = Number(record.heartRate);
                    const temp = Number(record.bodyTemperature);
                    const bmi = Number(record.bmi);

                    if (sys >= 160 || dia >= 100 || hr >= 140 || temp >= 39 || bmi >= 35) {
                      return { label: 'HIGH RISK', color: 'bg-red-500', text: 'text-white' };
                    }
                    if (sys >= 140 || dia >= 90 || hr >= 100 || temp >= 38 || bmi >= 30) {
                      return { label: 'MEDIUM RISK', color: 'bg-amber-500', text: 'text-white' };
                    }
                    
                    // If it's a pending status but vitals are fine
                    if (record.status?.includes('Synced') || record.status?.includes('Pending')) {
                      return { label: 'LOW RISK', color: 'bg-emerald-500', text: 'text-white' };
                    }

                    return { label: record.status.toUpperCase(), color: 'bg-emerald-500', text: 'text-white' };
                  };

                  const risk = getRiskStatus(latest);
                  const statusBg = risk.color;
                  const statusText = risk.text;

                  return (
                    <div className={`${statusBg} rounded-lg border-2 border-muted p-8 transition-all duration-200 card-hover`}>
                      <div className="flex items-center justify-between mb-8">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${latest ? 'bg-white/20' : 'bg-muted'}`}>
                          <Activity size={28} className={latest ? 'text-white' : 'text-muted-foreground'} strokeWidth={3} />
                        </div>
                        <Badge className={latest ? 'bg-white/20 text-white' : ''}>Status</Badge>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${latest ? 'text-white/60' : 'text-muted-foreground'}`}>Health Status</h3>
                          <p className={`text-4xl font-black uppercase tracking-tighter ${statusText}`}>
                            {risk.label}
                          </p>
                        </div>
                        
                        {latest && (latest.status.includes('Synced') || latest.status.includes('Pending')) && (
                          <div className="pt-4 border-t border-white/20 space-y-3">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-white/50">Latest Metrics</p>
                            <div className="flex gap-4">
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-white">{latest.heartRate}</span>
                                <span className="text-[8px] font-bold text-white/40 uppercase">BPM</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-white">{latest.systolicBp}/{latest.diastolicBp || 80}</span>
                                <span className="text-[8px] font-bold text-white/40 uppercase">BP</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* BMI Card */}
                <div className="bg-white rounded-lg border-4 border-muted p-8 transition-all duration-200 card-hover">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                      <User size={28} strokeWidth={3} />
                    </div>
                    <Badge variant="muted">BMI Index</Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Weight Status</h3>
                    {user.bmiHistory?.length > 0 ? (
                      <div>
                        <p className="text-4xl font-black tracking-tighter text-foreground">{user.bmiHistory[user.bmiHistory.length - 1].bmi}</p>
                        <p className="text-accent font-bold text-sm uppercase tracking-widest mt-2">
                          {user.bmiHistory[user.bmiHistory.length - 1].category}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xl font-bold text-muted-foreground italic uppercase">Not set</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* History Section */}
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Recent Activity</h3>
                <Link href="/health/history" className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline">Full History</Link>
              </div>
              
              <div className="space-y-3">
                {[...(user.healthHistory || []), ...(user.bmiHistory || [])]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 4)
                  .map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-5 bg-white rounded-md border-2 border-muted group transition-all duration-200 hover:border-accent">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-md flex items-center justify-center text-xl bg-muted text-foreground transition-colors group-hover:bg-accent group-hover:text-white`}>
                          {record.status ? '🩺' : '⚖️'}
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm uppercase tracking-tight">
                            {record.status || `BMI Record`}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.15em]">
                            {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-muted group-hover:text-accent transition-colors" />
                    </div>
                  ))}
                {(!user.healthHistory?.length && !user.bmiHistory?.length) && (
                  <div className="p-10 border-2 border-dashed border-muted rounded-lg text-center">
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">No active logs</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
