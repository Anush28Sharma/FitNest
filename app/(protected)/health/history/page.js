'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useAuth } from '@/lib/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Calendar, Utensils, Droplets, Dumbbell, ChevronRight, Filter, Plus, Activity, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const [filterType, setFilterType] = useState('all');

  if (loading || !user) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <LoadingSpinner size="xl" />
        </div>
      </DashboardLayout>
    );
  }

  const logs = [...(user.dailyLogs || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-6">
                <Link href="/health" className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-accent uppercase tracking-[0.2em] group">
                    <ArrowLeft size={14} strokeWidth={3} className="group-hover:-translate-x-2 transition-transform" />
                    Return to Analysis
                </Link>
                <div className="space-y-4">
                    <div className="flex">
                        <Badge dot variant="primary">History Archive</Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tighter uppercase leading-[0.85]">
                        Log <br />
                        <span className="text-accent">History.</span>
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg leading-snug max-w-lg">
                        Your complete nutrition and activity timeline stored in your secure history.
                    </p>
                </div>
            </div>
            <Link href="/health/log">
                <Button className="h-14 px-6 text-xs font-bold uppercase tracking-widest">
                    <Plus size={18} className="mr-2" strokeWidth={3} />
                    New Entry
                </Button>
            </Link>
        </div>

        {logs.length === 0 ? (
            <div className="bg-muted rounded-lg p-16 text-center space-y-8 border-4 border-dashed border-border max-w-3xl mx-auto">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-muted-foreground mx-auto">
                    <Calendar size={40} strokeWidth={3} />
                </div>
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground">Timeline Empty</h2>
                    <p className="text-muted-foreground font-medium text-base leading-snug max-w-sm mx-auto">
                        No historical logs detected. Initialize your health timeline.
                    </p>
                </div>
                <Link href="/health/log">
                    <Button className="h-16 px-10 text-lg">
                        First Log
                    </Button>
                </Link>
            </div>
        ) : (
            <div className="space-y-12 relative">
                {/* Timeline Line */}
                <div className="absolute left-6 md:left-8 top-0 bottom-0 w-1 bg-muted rounded-full" />

                {logs.map((day, idx) => (
                    <div key={idx} className="relative pl-14 md:pl-24 animate-fadeIn" style={{ animationDelay: `${idx * 0.1}s` }}>
                        {/* Timeline Connector */}
                        <div className="absolute left-6 md:left-8 -translate-x-1/2 top-10 w-6 h-6 rounded-full bg-white border-4 border-accent flex items-center justify-center z-10">
                            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-2xl font-black text-foreground uppercase tracking-tighter leading-none">
                                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'long' })}
                                </p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                                    {new Date(day.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>

                            <div className="bg-white border-4 border-muted rounded-lg p-6 md:p-8 transition-all duration-200 hover:border-accent">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                    
                                    {/* Daily Metrics Panel */}
                                    <div className="md:col-span-4 grid grid-cols-1 gap-3">
                                        <div className="p-4 bg-emerald-500 rounded-md text-white border-b-4 border-emerald-600">
                                            <p className="text-[9px] font-black uppercase tracking-[0.25em] mb-1.5 flex items-center gap-2">
                                                <Utensils size={12} strokeWidth={3} /> Intake
                                            </p>
                                            <p className="text-3xl font-black tracking-tighter">{day.totalCaloriesConsumed || 0} <span className="text-[10px] font-bold text-white/60">KCAL</span></p>
                                        </div>
                                        <div className="p-4 bg-accent rounded-md text-white border-b-4 border-accent-secondary">
                                            <p className="text-[9px] font-black uppercase tracking-[0.25em] mb-1.5 flex items-center gap-2">
                                                <Dumbbell size={12} strokeWidth={3} /> Burned
                                            </p>
                                            <p className="text-3xl font-black tracking-tighter">{day.totalCaloriesBurned || 0} <span className="text-[10px] font-bold text-white/60">KCAL</span></p>
                                        </div>
                                        <div className="p-4 bg-blue-500 rounded-md text-white border-b-4 border-blue-600">
                                            <p className="text-[9px] font-black uppercase tracking-[0.25em] mb-1.5 flex items-center gap-2">
                                                <Droplets size={12} strokeWidth={3} /> Water
                                            </p>
                                            <p className="text-3xl font-black tracking-tighter">{(day.waterIntake || 0) / 1000} <span className="text-[10px] font-bold text-white/60">LITERS</span></p>
                                        </div>
                                    </div>

                                    {/* Detail Collections */}
                                    <div className="md:col-span-8 space-y-8">
                                        {/* Meals List */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">Nutrition</h4>
                                                <div className="h-0.5 flex-1 bg-muted" />
                                            </div>
                                            {day.meals && day.meals.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {day.meals.map((m, mi) => (
                                                        <div key={mi} className="px-3 py-2 bg-muted rounded-md border-2 border-transparent hover:border-emerald-500 flex items-center gap-3 transition-all">
                                                            <span className="text-[10px] font-bold text-foreground uppercase tracking-tight">{m.dishName}</span>
                                                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{m.calories} KCAL</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase italic tracking-widest">No fuel logs</p>
                                            )}
                                        </div>

                                        {/* Activities List */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">Exercise</h4>
                                                <div className="h-0.5 flex-1 bg-muted" />
                                            </div>
                                            {day.exercises && day.exercises.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {day.exercises.map((e, ei) => (
                                                        <div key={ei} className="px-3 py-2 bg-muted rounded-md border-2 border-transparent hover:border-accent flex items-center gap-3 transition-all">
                                                            <span className="text-[10px] font-bold text-foreground uppercase tracking-tight">{e.activity}</span>
                                                            <span className="text-[9px] font-black text-accent uppercase tracking-widest">{e.duration} MIN</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase italic tracking-widest">No activity logs</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </DashboardLayout>
  );
}
