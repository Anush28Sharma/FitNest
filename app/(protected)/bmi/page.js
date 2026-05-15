"use client";

import ErrorMessage from "@/components/common/ErrorMessage";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { healthService } from "@/lib/api/health";
import Badge from "@/components/common/Badge";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { Ruler, Scale, Activity, ArrowRight, Info } from "lucide-react";

export default function BMIPage() {
  const { user, loading: authLoading, refetch } = useAuth();

  const [height, setHeight] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.healthHistory?.length > 0) {
      const lastEntry = [...user.healthHistory].reverse().find(entry => entry.height && entry.weight);
      if (lastEntry) {
        setHeight(lastEntry.height);
        setWeight(lastEntry.weight);
      }
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

  const calculateBMI = async () => {
    setError("");
    if (!height || !weight) {
      setError("Incomplete biometric data");
      return;
    }

    setLoading(true);
    try {
      const data = await healthService.logBMI({
        height: Number(height),
        heightUnit,
        weight: Number(weight),
        weightUnit,
      });
      setResult(data);
      await refetch();
      toast.success("BMI VECTOR UPDATED");
    } catch (err) {
      setError(err.message || "Calculation failed");
    } finally {
      setLoading(false);
    }
  };

  const getPointerPosition = (bmi) => {
    if (!bmi) return 0;
    const min = 15;
    const max = 40;
    const percent = ((bmi - min) / (max - min)) * 100;
    return Math.min(Math.max(percent, 0), 100);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-10 space-y-12 animate-fadeIn">
        <header className="space-y-4">
          <Badge variant="primary">Biometric Tool</Badge>
          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter leading-none">
            BMI <br />
            <span className="text-accent">Calculator.</span>
          </h1>
          <p className="text-muted-foreground font-medium text-lg leading-snug max-w-lg">
            Body Mass Index is a key vector in our AI analysis engine. Ensure your height and weight are current.
          </p>
        </header>

        <div className="grid md:grid-cols-[1fr_360px] gap-8">
          {/* Input Panel */}
          <div className="bg-white border-4 border-muted rounded-lg p-8 space-y-10">
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px] gap-4 items-end">
                <Input
                  id="input-height"
                  type="number"
                  label="Current Height"
                  placeholder="0.00"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  icon={<Ruler size={20} strokeWidth={3} />}
                />
                <select
                  id="select-height-unit"
                  value={heightUnit}
                  onChange={(e) => setHeightUnit(e.target.value)}
                  className="h-12 px-3 bg-muted text-foreground font-bold text-xs uppercase tracking-widest rounded-md focus:outline-none border-2 border-transparent focus:border-accent cursor-pointer transition-all"
                >
                  <option value="cm">cm</option>
                  <option value="m">m</option>
                  <option value="ft">ft</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px] gap-4 items-end">
                <Input
                  id="input-weight"
                  type="number"
                  label="Current Weight"
                  placeholder="0.00"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  icon={<Scale size={20} strokeWidth={3} />}
                />
                <select
                  id="select-weight-unit"
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value)}
                  className="h-12 px-3 bg-muted text-foreground font-bold text-xs uppercase tracking-widest rounded-md focus:outline-none border-2 border-transparent focus:border-accent cursor-pointer transition-all"
                >
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                </select>
              </div>

              <Button
                id="btn-calculate-bmi"
                onClick={calculateBMI}
                loading={loading}
                className="w-full h-16 text-lg"
              >
                Execute Calculation
                <ArrowRight size={20} className="ml-2" strokeWidth={3} />
              </Button>

              {error && <ErrorMessage message={error} />}
            </div>
            
            <div className="pt-8 border-t-2 border-muted flex items-center gap-3 text-muted-foreground">
              <Info size={16} strokeWidth={3} />
              <p className="text-[10px] font-bold uppercase tracking-widest">Data is saved to your digital health history</p>
            </div>
          </div>

          {/* Result Display */}
          <div className="flex flex-col gap-8">
            {result ? (
              <div id="bmi-result-display" className="bg-white border-4 border-muted rounded-lg p-8 space-y-10 animate-fadeIn flex flex-col items-center text-center">
                <div className="w-full space-y-3">
                  <div className="relative h-5 w-full bg-muted rounded-md overflow-hidden p-1">
                    <div className="absolute inset-y-1 left-0 w-[18.5%] bg-blue-500 rounded-sm" title="Underweight" />
                    <div className="absolute inset-y-1 left-[18.5%] w-[25%] bg-emerald-500 rounded-sm" title="Normal" />
                    <div className="absolute inset-y-1 left-[43.5%] w-[25%] bg-amber-500 rounded-sm" title="Overweight" />
                    <div className="absolute inset-y-1 left-[68.5%] w-[31.5%] bg-red-500 rounded-sm" title="Obese" />
                    
                    <div
                      className="absolute top-0 w-2 h-full bg-foreground transition-all duration-1000 z-10"
                      style={{ left: `${getPointerPosition(result.bmi)}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[8px] font-black uppercase tracking-tighter text-muted-foreground">
                    <div>Under</div>
                    <div>Normal</div>
                    <div>Over</div>
                    <div>Obese</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div id="bmi-value" className="text-6xl font-black tracking-tighter text-foreground leading-none">
                    {result.bmi}
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em]">Index Score</p>
                </div>
                
                <div
                  id="bmi-category"
                  className={`w-full py-4 rounded-lg text-lg font-black uppercase tracking-tight flex items-center justify-center gap-3 ${
                    result.category === "Underweight"
                      ? "bg-blue-500 text-white"
                      : result.category === "Normal"
                        ? "bg-emerald-500 text-white"
                        : result.category === "Overweight"
                          ? "bg-amber-500 text-white"
                          : "bg-red-500 text-white"
                  }`}
                >
                  <Activity size={20} strokeWidth={3} />
                  {result.category}
                </div>
              </div>
            ) : (
              <div id="bmi-placeholder" className="bg-muted rounded-lg p-12 border-4 border-dashed border-border flex flex-col items-center justify-center text-center gap-6 h-full min-h-[400px]">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-muted-foreground">
                  <Activity size={40} strokeWidth={3} />
                </div>
                <p className="text-muted-foreground font-bold text-lg uppercase tracking-tight max-w-[200px]">
                  Input biometrics to visualize result.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
