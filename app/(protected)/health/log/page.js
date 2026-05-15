'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { healthService } from '@/lib/api/health';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Heart, Moon, Activity, Save, ArrowLeft, Utensils, Droplets, Thermometer, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import NativeBatchLogger from '@/components/logs/NativeBatchLogger';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export default function HealthLogPage() {
  const { user, loading, refetch } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    sleepHours: '',
    heartRate: '',
    systolicBp: '',
    diastolicBp: '',
    bodyTemperature: '',
  });

  const [meals, setMeals] = useState([
    { dishName: '', calories: '', protein: '', carbs: '', fats: '', type: 'breakfast' }
  ]);
  const [exercises, setExercises] = useState([
    { activity: '', duration: '', caloriesBurned: '' }
  ]);
  const [waterIntake, setWaterIntake] = useState(0);

  useEffect(() => {
    if (user?.healthHistory?.length > 0) {
      const lastEntry = [...user.healthHistory]
        .reverse()
        .find(h => h.heartRate || h.sleepHours || h.systolicBp);
        
      if (lastEntry) {
        setFormData({
            sleepHours: lastEntry.sleepHours || '',
            heartRate: lastEntry.heartRate || '',
            systolicBp: lastEntry.systolicBp || '',
            diastolicBp: lastEntry.diastolicBp || '',
            bodyTemperature: lastEntry.bodyTemperature || '',
        });
      }
    }

    const hasBMI = (user?.bmiHistory && user.bmiHistory.length > 0) || (user?.healthHistory?.some(h => h.bmi));
    const isProfileComplete = user?.dateOfBirth && user?.gender;

    if (user && !loading) {
        if (!hasBMI) {
            toast((t) => (
                <div className="flex flex-col gap-3 p-2">
                    <span className="font-bold uppercase tracking-tight">Missing BMI Record</span>
                    <span className="text-xs font-medium">Your AI analysis requires current height and weight data.</span>
                    <button 
                        size="sm"
                        onClick={() => {
                            toast.dismiss(t.id);
                            router.push('/bmi');
                        }}
                        className="bg-accent text-white px-4 py-2 rounded-md font-bold uppercase text-[10px]"
                    >
                        Add Vitals
                    </button>
                </div>
            ), { id: 'bmi-warning', duration: 6000 });
        }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <LoadingSpinner size="xl" />
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const notification = toast.loading('Saving your data...');

    try {
      const res = await fetch('/api/user/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString(),
          ...formData,
          meals,
          exercises,
          waterIntake
        })
      });

      if (res.ok) {
          await refetch();
          toast.success('DATA SAVED', { id: notification });
          router.push('/health');
      } else {
          const errorData = await res.json();
          throw new Error(errorData.details || errorData.error || 'Failed to save logs');
      }
    } catch (error) {
      toast.error(error.message, { id: notification });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
       <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn pb-20">
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-6">
              <button 
                id="btn-back"
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-accent uppercase tracking-[0.2em] transition-all group"
              >
                <ArrowLeft size={14} strokeWidth={3} className="group-hover:-translate-x-2 transition-transform" />
                Return to Dashboard
              </button>
              <div className="space-y-4">
                <div className="flex">
                  <Badge dot variant="secondary">Manual Input Mode</Badge>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tighter uppercase leading-[0.85]">
                  Update <br />
                  <span className="text-accent">Vitals.</span>
                </h1>
                <p className="text-muted-foreground font-medium text-lg leading-snug max-w-lg">
                  Refine your health details to ensure AI accuracy.
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4 p-6 bg-muted rounded-lg border-2 border-border">
               <div className="w-12 h-12 bg-accent rounded-md flex items-center justify-center text-white">
                  <Activity size={28} strokeWidth={3} />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                  <p className="text-base font-black text-foreground uppercase tracking-tight">System Ready</p>
               </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12 animate-fadeIn pb-24">
            {/* Vitals Section */}
            <div className="bg-white border-4 border-muted rounded-lg p-8 space-y-10">
                <div className="flex items-center gap-4">
                   <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Health Stats</h2>
                   <div className="h-1 flex-1 bg-muted" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <Input
                    id="input-sleep-hours"
                    type="number"
                    step="0.1"
                    label="Sleep (Hours)"
                    required
                    value={formData.sleepHours}
                    onChange={e => setFormData({...formData, sleepHours: e.target.value})}
                    placeholder="7.5"
                    icon={<Moon size={20} strokeWidth={3} />}
                  />
                  
                  <Input
                    id="input-heart-rate"
                    type="number"
                    label="Heart Rate (BPM)"
                    required
                    value={formData.heartRate}
                    onChange={e => setFormData({...formData, heartRate: e.target.value})}
                    placeholder="72"
                    icon={<Heart size={20} strokeWidth={3} />}
                  />

                  <div className="grid grid-cols-2 gap-6">
                    <Input
                      id="input-systolic-bp"
                      type="number"
                      label="BP (Systolic)"
                      required
                      value={formData.systolicBp}
                      onChange={e => setFormData({...formData, systolicBp: e.target.value})}
                      placeholder="120"
                      icon={<Activity size={20} strokeWidth={3} />}
                    />
                    <Input
                      id="input-diastolic-bp"
                      type="number"
                      label="BP (Diastolic)"
                      required
                      value={formData.diastolicBp}
                      onChange={e => setFormData({...formData, diastolicBp: e.target.value})}
                      placeholder="80"
                    />
                  </div>

                  <Input
                    id="input-body-temperature"
                    type="number"
                    step="0.1"
                    label="Temperature (°C)"
                    required
                    value={formData.bodyTemperature}
                    onChange={e => setFormData({...formData, bodyTemperature: e.target.value})}
                    placeholder="36.6"
                    icon={<Thermometer size={20} strokeWidth={3} />}
                  />

                </div>
            </div>

            {/* Activity Logging Section */}
            <div className="bg-white border-4 border-muted rounded-lg p-8 space-y-10">
                <div className="flex items-center gap-4">
                   <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Daily Activity</h2>
                   <div className="h-1 flex-1 bg-muted" />
                </div>

                <NativeBatchLogger 
                  meals={meals} 
                  setMeals={setMeals}
                  exercises={exercises}
                  setExercises={setExercises}
                  waterIntake={waterIntake}
                  setWaterIntake={setWaterIntake}
                />
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-10 pt-8 border-t-4 border-muted">
              <p className="text-sm text-muted-foreground font-medium max-w-sm leading-snug">
                Submitting this log will instantly re-calculate your <span className="text-foreground font-bold uppercase">Health Status</span> across all predictive modules.
              </p>
              
              <Button
                id="btn-save-health-data"
                type="submit"
                disabled={saving}
                loading={saving}
                size="lg"
                className="w-full md:w-auto h-16 px-12 text-lg"
              >
                Save Health Data
                <Zap size={20} className="ml-3" strokeWidth={3} />
              </Button>
            </div>
          </form>
        </div>
    </DashboardLayout>
  );
}
