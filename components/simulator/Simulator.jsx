'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, Zap, Activity, RotateCcw, AlertTriangle, ShieldCheck, Info, ChevronRight } from 'lucide-react';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';

// Simple debounce utility
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function Simulator({ initialData }) {
    const [weight, setWeight] = useState(initialData.weight || 70);
    const [hr, setHr] = useState(initialData.heartRate || 75);
    const [sys, setSys] = useState(initialData.systolicBp || 120);
    const [dia, setDia] = useState(initialData.diastolicBp || 80);
    const [temp, setTemp] = useState(initialData.bodyTemperature || 36.6);

    const vitals = useMemo(() => ({ weight, hr, sys, dia, temp }), [weight, hr, sys, dia, temp]);
    const [status, setStatus] = useState(initialData.status || 'Normal');
    const [confidence, setConfidence] = useState(initialData.confidence || 0.85);
    const [simBmi, setSimBmi] = useState(initialData.bmi || 'Not Calculated');
    const [isSimulating, setIsSimulating] = useState(false);
    const [error, setError] = useState(null);

    const debouncedValues = useDebounce(vitals, 400);

    const runSimulation = useCallback(async (vitals) => {
        setIsSimulating(true);
        setError(null);
        try {
            const res = await fetch('/api/user/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    weight: vitals.weight,
                    heart_rate: vitals.hr,
                    systolic_bp: vitals.sys,
                    diastolic_bp: vitals.dia,
                    body_temperature: vitals.temp
                })
            });

            const data = await res.json();
            if (res.ok) {
                setStatus(data.status);
                setConfidence(data.confidence);
                setSimBmi(data.simulatedBmi);
            } else {
                setError(data.error || 'Simulation failed');
            }
        } catch (err) {
            console.error("Simulation failed", err);
            setError("Connection to simulation service failed.");
        } finally {
            setIsSimulating(false);
        }
    }, []);

    useEffect(() => {
        runSimulation(debouncedValues);
    }, [debouncedValues, runSimulation]);

    // Color Logic for Flat Aesthetic
    let primaryColor = 'text-accent';
    let bgColor = 'bg-blue-50';
    let borderColor = 'border-accent';
    let AuraIcon = ShieldCheck;
    
    if (status === 'High Risk' || status === 'Critical') {
        primaryColor = 'text-red-500';
        bgColor = 'bg-red-500';
        borderColor = 'border-red-500';
        AuraIcon = AlertTriangle;
    } else if (status === 'Medium Risk' || status === 'Warning') {
        primaryColor = 'text-amber-500';
        bgColor = 'bg-amber-500';
        borderColor = 'border-amber-500';
        AuraIcon = Zap;
    } else if (status !== 'Not Calculated') {
        primaryColor = 'text-emerald-500';
        bgColor = 'bg-emerald-500';
        borderColor = 'border-emerald-500';
        AuraIcon = Activity;
    }

    return (
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            {/* Simulation Stage - Geometric Poster Look */}
            <div className={`relative aspect-square md:aspect-video lg:aspect-auto rounded-lg overflow-hidden border-4 ${borderColor} bg-white flex flex-col items-center justify-center p-6 transition-colors duration-500`}>
                {/* Geometric Grid Background */}
                <div className="absolute inset-0 geometric-bg opacity-30 pointer-events-none" />
                
                {/* Status Indicator */}
                <div className="absolute top-6 left-6 flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${isSimulating ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    {isSimulating ? 'Analyzing...' : 'Ready'}
                  </span>
                </div>

                {/* HEALTH STATUS */}
                <div className="relative flex items-center justify-center w-40 h-40 md:w-52 md:h-52 mb-6 z-10">
                    {/* Concentric Circles */}
                    <div className={`absolute inset-0 rounded-full border-4 ${borderColor} opacity-10 scale-125 animate-pulse`} />
                    <div className={`absolute inset-4 rounded-full border-4 ${borderColor} opacity-20 scale-110`} />
                    <div className={`absolute inset-8 rounded-full border-8 ${borderColor} opacity-30`} />
                    
                    {/* Central Hub */}
                    <div className={`w-28 h-28 rounded-full ${status === 'Normal' ? 'bg-white' : bgColor} border-4 ${borderColor} z-10 flex flex-col items-center justify-center transition-colors duration-500 shadow-none`}>
                         <AuraIcon size={48} strokeWidth={3} className={status === 'Normal' ? primaryColor : 'text-white'} />
                         {isSimulating && (
                           <div className="absolute inset-0 rounded-full border-4 border-dashed border-accent animate-[spin_8s_linear_infinite]" />
                         )}
                    </div>
                </div>

                {/* OUTPUT HUD - Bold Color Blocks */}
                <div className="w-full max-w-lg grid grid-cols-2 gap-4 relative z-10">
                    <div className={`col-span-2 ${status === 'Normal' ? 'bg-muted' : bgColor} p-6 rounded-lg text-center transition-colors duration-500`}>
                        {error ? (
                            <p className="text-red-900 text-xs font-bold uppercase">{error}</p>
                        ) : (
                          <>
                            <span className={`text-[9px] font-bold uppercase tracking-[0.3em] ${status === 'Normal' ? 'text-muted-foreground' : 'text-white/60'}`}>Predicted Status</span>
                            <h3 className={`text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none mt-1 ${status === 'Normal' ? 'text-foreground' : 'text-white'}`}>
                                {isSimulating ? 'Analyzing...' : status}
                            </h3>
                          </>
                        )}
                    </div>
                    
                    <div className="bg-muted p-4 rounded-lg border-2 border-border">
                        <p className="text-muted-foreground text-[9px] uppercase font-bold tracking-widest mb-1">Accuracy</p>
                        <p className="text-foreground font-black text-xl">{(confidence * 100).toFixed(1)}%</p>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-lg border-2 border-border">
                        <p className="text-muted-foreground text-[9px] uppercase font-bold tracking-widest mb-1">Simulated BMI</p>
                        <p className="text-foreground font-black text-xl">{simBmi}</p>
                    </div>
                </div>
            </div>

            {/* Slider Panel - Clean Flat Structure */}
            <div className="bg-white border-4 border-muted rounded-lg p-6 space-y-8">
                <div className="space-y-4">
                  <Badge variant="primary">Adjust Health Stats</Badge>
                  <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground">Simulator Settings</h2>
                  <p className="text-muted-foreground font-medium text-sm leading-snug">
                    Directly change your health stats to see how the system re-evaluates your health.
                  </p>
                </div>

                <div className="space-y-6">
                    {[
                      { id: 'weight', label: 'Weight', value: weight, setter: setWeight, unit: 'kg', min: 30, max: 200, step: 1, color: 'accent' },
                      { id: 'hr', label: 'Heart Rate', value: hr, setter: setHr, unit: 'bpm', min: 40, max: 180, step: 1, color: 'red-500' },
                      { id: 'sys', label: 'BP (Systolic)', value: sys, setter: setSys, unit: 'mmHg', min: 80, max: 200, step: 1, color: 'accent-secondary' },
                      { id: 'dia', label: 'BP (Diastolic)', value: dia, setter: setDia, unit: 'mmHg', min: 40, max: 120, step: 1, color: 'accent-secondary' },
                      { id: 'temp', label: 'Temperature', value: temp, setter: setTemp, unit: '°C', min: 35, max: 42, step: 0.1, color: 'amber-500' },
                    ].map(slider => (
                      <div key={slider.id} className="space-y-4">
                          <div className="flex justify-between items-end">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{slider.label}</label>
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-foreground tracking-tighter">{slider.value}</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{slider.unit}</span>
                              </div>
                          </div>
                          <div className="relative h-2 flex items-center">
                            <input 
                              type="range" 
                              min={slider.min} 
                              max={slider.max} 
                              step={slider.step}
                              value={slider.value} 
                              onChange={(e) => slider.setter(Number(e.target.value))} 
                              className="w-full h-2 bg-muted rounded-md appearance-none cursor-pointer accent-accent transition-all" 
                            />
                          </div>
                      </div>
                    ))}
                </div>

                <div className="pt-8 border-t-4 border-muted flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Info size={18} strokeWidth={3} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Reset Stats</span>
                    </div>
                    <Button 
                      variant="secondary"
                      onClick={() => {
                        setWeight(initialData.weight || 70);
                        setHr(initialData.heartRate || 75);
                        setSys(initialData.systolicBp || 120);
                        setDia(initialData.diastolicBp || 80);
                        setTemp(initialData.bodyTemperature || 36.6);
                      }} 
                      className="w-full sm:w-auto h-12 px-6"
                    >
                      <RotateCcw size={18} className="mr-2" strokeWidth={3} />
                      Reset to Actual Data
                    </Button>
                </div>
            </div>
        </div>
    );
}
