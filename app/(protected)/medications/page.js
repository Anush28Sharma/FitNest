'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Pill, Plus, Check, Trash2, Clock, CalendarDays, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export default function MedicationsPage() {
  const { user, loading, refetch } = useAuth();
  const router = useRouter();
  
  const [medications, setMedications] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    unit: 'mg',
    frequency: 'Daily',
    time: '',
    instructions: ''
  });

  useEffect(() => {
    if (user && !loading) {
      fetchMedications();
    }
  }, [user, loading]);

  const fetchMedications = async () => {
    try {
      const res = await fetch('/api/user/medications');
      if (res.ok) {
        const data = await res.json();
        setMedications(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch medications:', error);
      toast.error('Failed to load medications');
    } finally {
      setFetching(false);
    }
  };

  if (loading || fetching) {
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
    const notification = toast.loading('Adding medication...');

    try {
      const res = await fetch('/api/user/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
          const addedMed = await res.json();
          setMedications([...medications, addedMed]);
          toast.success('Medication added', { id: notification });
          setFormData({ name: '', dosage: '', unit: 'mg', frequency: 'Daily', time: '', instructions: '' });
      } else {
          const errorData = await res.json();
          throw new Error(errorData.details || errorData.error || 'Failed to add medication');
      }
    } catch (error) {
      toast.error(error.message, { id: notification });
    } finally {
      setSaving(false);
    }
  };

  const handleMarkTaken = async (id) => {
    const notification = toast.loading('Updating...');
    try {
      const res = await fetch(`/api/user/medications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markTaken: true })
      });

      if (res.ok) {
          toast.success('Marked as taken!', { id: notification });
          fetchMedications();
      } else {
          throw new Error('Failed to update');
      }
    } catch (error) {
      toast.error(error.message, { id: notification });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this medication?')) return;
    
    const notification = toast.loading('Deleting...');
    try {
      const res = await fetch(`/api/user/medications/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
          toast.success('Medication deleted', { id: notification });
          setMedications(medications.filter(m => m._id !== id));
      } else {
          throw new Error('Failed to delete');
      }
    } catch (error) {
      toast.error(error.message, { id: notification });
    }
  };

  const isTakenRecently = (lastTaken, frequency) => {
      if (!lastTaken) return false;
      const takenDate = new Date(lastTaken);
      const today = new Date();
      
      if (frequency === 'Weekly') {
          // Lock for 6 days so they can take it on the 7th day
          const diffTime = Math.abs(today.getTime() - takenDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 6;
      }
      
      if (frequency === 'As Needed') {
          // Lock for 4 hours to prevent accidental double-clicks, 
          // but allow taking multiple times a day
          const diffTime = Math.abs(today.getTime() - takenDate.getTime());
          const diffHours = diffTime / (1000 * 60 * 60);
          return diffHours < 4;
      }

      // Default logic for 'Daily'
      return takenDate.getDate() === today.getDate() &&
             takenDate.getMonth() === today.getMonth() &&
             takenDate.getFullYear() === today.getFullYear();
  };

  return (
    <DashboardLayout>
       <div className="max-w-5xl mx-auto space-y-12 animate-fadeIn pb-20">
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex">
                  <Badge dot variant="secondary">Adherence Tracker</Badge>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tighter uppercase leading-[0.85]">
                  Pill <br />
                  <span className="text-accent">Manager.</span>
                </h1>
                <p className="text-muted-foreground font-medium text-lg leading-snug max-w-lg">
                  Keep track of your daily medications and supplements.
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4 p-6 bg-muted rounded-lg border-2 border-border">
               <div className="w-12 h-12 bg-accent rounded-md flex items-center justify-center text-white">
                  <Pill size={28} strokeWidth={3} />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Active Prescriptions</p>
                  <p id="medication-count" className="text-base font-black text-foreground uppercase tracking-tight">{medications.length} Registered</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
            
            {/* List Section */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold uppercase tracking-tight text-foreground">Your Schedule</h2>
              
              <div className="space-y-4" id="medication-list">
                {medications.length === 0 ? (
                  <div className="p-10 border-4 border-dashed border-muted rounded-lg text-center space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground mx-auto">
                        <Pill size={32} strokeWidth={3} />
                    </div>
                    <p className="text-muted-foreground font-bold uppercase tracking-widest">No medications added yet.</p>
                  </div>
                ) : (
                  medications.map((med) => {
                    const takenRecently = isTakenRecently(med.lastTaken, med.frequency);
                    return (
                      <div key={med._id} className={`p-6 rounded-lg border-4 transition-all duration-200 ${takenRecently ? 'bg-muted border-muted' : 'bg-white border-foreground'} flex flex-col sm:flex-row sm:items-center justify-between gap-6`}>
                        <div className="flex items-center gap-5">
                            <div className={`w-14 h-14 rounded-md flex items-center justify-center ${takenRecently ? 'bg-white text-emerald-500' : 'bg-foreground text-white'}`}>
                                {takenRecently ? <Check size={28} strokeWidth={4} /> : <Pill size={28} strokeWidth={3} />}
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight text-foreground">{med.name}</h3>
                                <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">
                                    <span>{med.dosage}{med.unit}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Clock size={12} /> {med.time || 'Anytime'}</span>
                                    <span>•</span>
                                    <span>{med.frequency}</span>
                                </div>
                                {med.instructions && (
                                    <p className="text-xs font-medium text-muted-foreground mt-2">{med.instructions}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleMarkTaken(med._id)}
                                disabled={takenRecently}
                                className={`flex-1 sm:flex-none px-6 py-3 rounded-md font-bold uppercase tracking-widest text-xs transition-all ${takenRecently ? 'bg-emerald-500 text-white cursor-not-allowed opacity-50' : 'bg-accent text-white hover:scale-105'}`}
                            >
                                {takenRecently ? 'Taken' : 'Mark Taken'}
                            </button>
                            <button
                                onClick={() => handleDelete(med._id)}
                                className="p-3 rounded-md bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
                            >
                                <Trash2 size={18} strokeWidth={3} />
                            </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Add Form Section */}
            <div className="space-y-8">
                <div className="bg-white border-4 border-muted rounded-lg p-8 space-y-8 sticky top-24">
                    <div className="flex items-center gap-4">
                        <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Add New</h2>
                        <div className="h-1 flex-1 bg-muted" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6" id="add-medication-form">
                        <Input
                            id="input-med-name"
                            type="text"
                            label="Medicine Name"
                            required
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            placeholder="e.g. Vitamin D3"
                            icon={<Pill size={20} strokeWidth={3} />}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                id="input-med-dosage"
                                type="number"
                                step="0.1"
                                label="Dosage"
                                required
                                value={formData.dosage}
                                onChange={e => setFormData({...formData, dosage: e.target.value})}
                                placeholder="500"
                            />
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Unit</label>
                                <select 
                                    id="select-med-unit"
                                    value={formData.unit} 
                                    onChange={e => setFormData({...formData, unit: e.target.value})}
                                    className="w-full h-12 px-4 rounded-md bg-muted border-2 border-transparent focus:border-accent focus:bg-white transition-colors outline-none font-medium text-foreground"
                                >
                                    <option value="mg">mg</option>
                                    <option value="ml">ml</option>
                                    <option value="tablets">tablets</option>
                                    <option value="units">units</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Frequency</label>
                                <select 
                                    id="select-med-freq"
                                    value={formData.frequency} 
                                    onChange={e => setFormData({...formData, frequency: e.target.value})}
                                    className="w-full h-12 px-4 rounded-md bg-muted border-2 border-transparent focus:border-accent focus:bg-white transition-colors outline-none font-medium text-foreground"
                                >
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="As Needed">As Needed</option>
                                </select>
                            </div>
                            <Input
                                id="input-med-time"
                                type="time"
                                label="Time (Optional)"
                                value={formData.time}
                                onChange={e => setFormData({...formData, time: e.target.value})}
                                icon={<Clock size={20} strokeWidth={3} />}
                            />
                        </div>

                        <Input
                            id="input-med-instructions"
                            type="text"
                            label="Instructions (Optional)"
                            value={formData.instructions}
                            onChange={e => setFormData({...formData, instructions: e.target.value})}
                            placeholder="e.g. After breakfast"
                        />

                        <Button
                            id="btn-add-medication"
                            type="submit"
                            disabled={saving}
                            loading={saving}
                            size="lg"
                            className="w-full h-14 text-base"
                        >
                            <Plus size={20} className="mr-2" strokeWidth={3} />
                            Add to Schedule
                        </Button>
                    </form>
                </div>
            </div>

          </div>
       </div>
    </DashboardLayout>
  );
}
