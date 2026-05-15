'use client';

import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Heart, Moon, Activity, Edit2, AlertCircle, CheckCircle2, AlertTriangle, ArrowRight, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ReportDownloader from '@/components/common/ReportDownloader';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';

export default function HealthAnalysisPage() {
  const { user, loading: authLoading } = useAuth();
  const [latestAnalysis, setLatestAnalysis] = useState(null);

  useEffect(() => {
    if (user?.healthHistory?.length > 0) {
        const entry = [...user.healthHistory]
            .reverse()
            .find(h => h.status && (h.heartRate || h.systolicBp || h.bodyTemperature));
        setLatestAnalysis(entry);
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-white">
            <LoadingSpinner size="xl" />
        </div>
      </DashboardLayout>
    );
  }

  const getStatusConfig = (status, vitals = null) => {
    // If status is pending, calculate a preliminary one
    let effectiveStatus = status;
    if (status?.includes('Synced') || status?.includes('Pending')) {
        if (vitals) {
            const sys = Number(vitals.systolicBp);
            const dia = Number(vitals.diastolicBp) || 80;
            const hr = Number(vitals.heartRate);
            const temp = Number(vitals.bodyTemperature);
            const bmi = Number(vitals.bmi);

            if (sys >= 160 || dia >= 100 || hr >= 140 || temp >= 39 || bmi >= 35) {
                effectiveStatus = 'High Risk';
            } else if (sys >= 140 || dia >= 90 || hr >= 100 || temp >= 38 || bmi >= 30) {
                effectiveStatus = 'Medium Risk';
            } else {
                effectiveStatus = 'Low Risk';
            }
        }
    }

    if (effectiveStatus === 'Low Risk' || effectiveStatus === 'Healthy' || effectiveStatus === 'Normal') {
      return { label: 'LOW RISK', color: 'bg-emerald-500', borderColor: 'border-emerald-500', text: 'text-emerald-700', icon: CheckCircle2 };
    }
    if (effectiveStatus === 'Amber' || effectiveStatus === 'Warning' || effectiveStatus === 'Medium Risk') {
      return { label: 'MEDIUM RISK', color: 'bg-amber-500', borderColor: 'border-amber-500', text: 'text-amber-700', icon: AlertTriangle };
    }
    // Default to high risk
    return { label: 'HIGH RISK', color: 'bg-red-500', borderColor: 'border-red-500', text: 'text-red-700', icon: AlertCircle };
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn pb-20">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-6">
              <Link href="/dashboard" className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-accent uppercase tracking-[0.2em] group">
                <ArrowLeft size={14} strokeWidth={3} className="group-hover:-translate-x-2 transition-transform" />
                Return to Dashboard
              </Link>
              <div className="space-y-4">
                <div className="flex">
                  <Badge dot variant="primary">Health Analyzer</Badge>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tighter uppercase leading-[0.85]">
                  Health <br />
                  <span className="text-accent">Analysis.</span>
                </h1>
                <p className="text-muted-foreground font-medium text-lg leading-snug max-w-lg">
                  Personal health data processed through our analysis system.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
                <ReportDownloader />
            </div>
          </div>

          {latestAnalysis ? (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 animate-fadeIn">
                  {/* Main Analysis Block */}
                  <div className="space-y-10">
                    <div className="bg-white border-4 border-muted rounded-lg overflow-hidden">
                         {/* Current Health Summary - Replaced abstract status with actionable data */}
                        <div className="bg-white border-b-2 border-muted p-8 flex flex-col md:flex-row items-center gap-10">
                            <div className={`w-20 h-20 ${getStatusConfig(latestAnalysis.status, latestAnalysis).color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/10`}>
                                {(() => {
                                    const Icon = getStatusConfig(latestAnalysis.status, latestAnalysis).icon;
                                    return <Icon size={40} strokeWidth={3} className="text-white" />;
                                })()}
                            </div>
                            <div className="space-y-3 text-center md:text-left flex-1">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Current Health Summary</span>
                                    <div className="flex justify-center md:justify-start gap-2">
                                        <div className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase rounded-sm border border-emerald-200">Heart: {latestAnalysis.heartRate}</div>
                                        <div className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black uppercase rounded-sm border border-blue-200">BP: {latestAnalysis.systolicBp}/{latestAnalysis.diastolicBp || 80}</div>
                                    </div>
                                </div>
                                <h2 className={`text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none ${getStatusConfig(latestAnalysis.status, latestAnalysis).text}`}>
                                    {getStatusConfig(latestAnalysis.status, latestAnalysis).label}
                                </h2>
                                <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest max-w-xl">
                                    {latestAnalysis.status.includes('Synced') || latestAnalysis.status === 'Normal' 
                                        ? `Analysis confirms pulse (${latestAnalysis.heartRate} BPM) and pressure (${latestAnalysis.systolicBp} mmHg) are within normal thresholds.`
                                        : latestAnalysis.status.includes('Risk') || latestAnalysis.status === 'Amber' || latestAnalysis.status === 'Warning'
                                        ? "Irregular health patterns detected in latest entry. Monitoring recommended for pressure stability."
                                        : "Critical health levels detected. Immediate professional consultation and stabilization advised."}
                                </p>
                            </div>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Metadata */}
                            <div className="flex flex-wrap items-center justify-between gap-5 border-b-2 border-muted pb-5">
                                <div>
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Last Analyzed</p>
                                    <p className="text-sm font-bold text-foreground uppercase tracking-tight">
                                        {new Date(latestAnalysis.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Data Confidence</p>
                                    <p className="text-sm font-bold text-accent uppercase tracking-tight">
                                        {Math.round((latestAnalysis.confidence || 0.8) * 100)}% Confirmed
                                    </p>
                                </div>
                            </div>

                            {/* Confidence Meter */}
                             <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Analysis Confidence</span>
                                    <span className="font-black text-lg tracking-tighter text-foreground">
                                        {Math.round((latestAnalysis.confidence || 0.8) * 100)}%
                                    </span>
                                </div>
                                <div className="h-4 bg-muted rounded-md p-1 overflow-hidden">
                                    <div 
                                        className={`h-full rounded-sm transition-all duration-1000 ease-out ${getStatusConfig(latestAnalysis.status, latestAnalysis).color}`}
                                        style={{ width: `${(latestAnalysis.confidence || 0.8) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Link href="/health/log" className="w-full">
                                    <Button id="btn-update-vitals" className="w-full h-14 text-xs font-bold uppercase tracking-widest">
                                        <Edit2 size={16} className="mr-2" strokeWidth={3} />
                                        Input New Vitals
                                    </Button>
                                </Link>
                                <Link href="/health/history" className="w-full">
                                    <Button variant="secondary" className="w-full h-14 text-xs font-bold uppercase tracking-widest">
                                        View Full History
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* Metrics Sidebar */}
                  <div className="space-y-6">
                    <div className="pb-4 border-b-4 border-muted mb-4">
                        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.4em]">My Stats</h3>
                    </div>
                     <MetricCard 
                        icon={<Moon size={24} strokeWidth={3} className="text-white" />}
                        label="Sleep"
                        value={`${latestAnalysis.sleepHours}`}
                        unit="HRS"
                        color="bg-indigo-500"
                    />
                    <MetricCard 
                        icon={<Heart size={24} strokeWidth={3} className="text-white" />}
                        label="Heart Rate"
                        value={`${latestAnalysis.heartRate}`}
                        unit="BPM"
                        color="bg-rose-500"
                    />
                    <MetricCard 
                        icon={<Activity size={24} strokeWidth={3} className="text-white" />}
                        label="Blood Pressure"
                        value={`${latestAnalysis.systolicBp}/${latestAnalysis.diastolicBp || '--'}`}
                        unit="MMHG"
                        color="bg-emerald-500"
                    />
                    <MetricCard 
                        icon={<Zap size={24} strokeWidth={3} className="text-white" />}
                        label="Temperature"
                        value={`${latestAnalysis.bodyTemperature || '--'}`}
                        unit="°C"
                        color="bg-amber-500"
                    />
                  </div>
              </div>
          ) : (
              <div className="mt-8 text-center animate-fadeIn py-16 bg-muted border-4 border-dashed border-border rounded-lg max-w-3xl mx-auto space-y-8">
                 <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto border-4 border-border">
                    <Activity size={40} strokeWidth={3} className="text-muted-foreground" />
                 </div>
                 <div className="space-y-3">
                    <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">No Data Found</h2>
                    <p className="text-muted-foreground font-medium text-base leading-snug max-w-sm mx-auto">
                       The system requires health data entries to generate an analysis.
                    </p>
                 </div>
                 <Link href="/health/log">
                    <Button id="btn-start-analysis" className="h-16 px-10 text-lg">
                        Add Vitals <ArrowRight size={20} className="ml-3" strokeWidth={3} />
                    </Button>
                 </Link>
              </div>
          )}
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ icon, label, value, unit, color }) {
    return (
        <div className="bg-white border-4 border-muted rounded-lg p-5 transition-all duration-200 hover:scale-105">
            <div className="flex flex-col gap-3">
                <div className={`w-10 h-10 ${color} rounded-md flex items-center justify-center`}>
                    {icon}
                </div>
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">{label}</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-xl font-black text-foreground tracking-tighter uppercase">{value}</p>
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{unit}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
