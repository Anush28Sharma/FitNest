import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import Simulator from '@/components/simulator/Simulator';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { AlertTriangle, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function SimulatorPage() {
    const sessionUser = await getCurrentUser();
    
    if (!sessionUser) {
        redirect('/login');
    }

    await connectDB();
    const user = await User.findById(sessionUser.id).lean();

    if (!user) {
        redirect('/login');
    }

    let latestVitals = null;
    let latestStatus = 'Not Calculated';
    let latestConfidence = 0;

    if (user.healthHistory && user.healthHistory.length > 0) {
        const historySorted = [...user.healthHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
        latestVitals = historySorted[historySorted.length - 1];
        if (latestVitals) {
             latestStatus = latestVitals.status || 'Normal';
             latestConfidence = latestVitals.confidence || 0.85;
        }
    }

    let latestWeight = user.weight || 70;
    if (user.bmiHistory && user.bmiHistory.length > 0) {
        const sortedBmi = [...user.bmiHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
        latestWeight = sortedBmi[0].weight;
    }

    const baselineWeight = latestWeight;

    if (!latestVitals || !latestVitals.heartRate) {
        return (
             <DashboardLayout>
                <div className="max-w-3xl mx-auto py-12 animate-fadeIn">
                    <div className="bg-muted border-4 border-amber-500 p-8 md:p-10 rounded-lg text-center space-y-6">
                        <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center text-white mx-auto shadow-none">
                            <AlertTriangle size={36} strokeWidth={3} />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-foreground">Health Data Required</h2>
                            <p className="text-muted-foreground font-medium text-base leading-snug max-w-xl mx-auto">
                                The Health Simulator uses your actual health data to project "What-If" scenarios. 
                                Please add your health stats first.
                            </p>
                        </div>
                        <div className="flex justify-center pt-4">
                            <Link href="/health/log">
                                <Button size="lg" className="h-12 px-8 text-base">
                                    <Plus size={20} className="mr-2" strokeWidth={3} />
                                    Add Vitals
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const initialData = {
        weight: baselineWeight,
        heartRate: latestVitals.heartRate,
        systolicBp: latestVitals.systolicBp,
        diastolicBp: latestVitals.diastolicBp,
        bodyTemperature: latestVitals.bodyTemperature,
        status: latestStatus,
        confidence: latestConfidence,
        bmi: latestVitals.bmi || (baselineWeight / ((user.height || 170)/100)**2).toFixed(1)
    };

    return (
        <DashboardLayout>
             <div className="space-y-8 animate-fadeIn">
                <div className="grid md:grid-cols-[1fr_auto] items-end gap-6">
                    <div className="space-y-3">
                        <div className="flex">
                            <Badge dot variant="secondary">AI Simulation Active</Badge>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tighter uppercase leading-[0.85]">
                          Simulate <br />
                          <span className="text-accent">Future.</span>
                        </h1>
                        <p className="text-muted-foreground font-medium text-base max-w-lg leading-snug">
                          Explore how changes to your lifestyle and health stats impact your predicted health.
                        </p>
                    </div>
                </div>
                
                <Simulator initialData={initialData} />
             </div>
        </DashboardLayout>
    );
}

export const dynamic = 'force-dynamic';
