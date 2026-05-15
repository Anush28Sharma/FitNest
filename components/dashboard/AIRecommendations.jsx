'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Activity, Zap } from 'lucide-react';
import Badge from '@/components/common/Badge';

export default function AIRecommendations({ user }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      const goal = user?.healthGoal || 'maintenance';
      try {
        const res = await fetch(`/api/ml/food/recommend?goal=${goal}`);
        const data = await res.json();
        setRecommendations(data);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecs();
  }, [user]);

  if (loading) return null;

  return (
    <div id="ai-recommendations-card" className="relative overflow-hidden p-8 md:p-12">
        {/* Geometric Background Element */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-accent opacity-10 rounded-full pointer-events-none" />
        
        <div className="relative z-10 space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 border-b-4 border-muted pb-10">
                <div className="space-y-6">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-accent rounded-md flex items-center justify-center text-white">
                            <Sparkles size={28} strokeWidth={3} />
                        </div>
                        <h3 className="text-4xl font-black uppercase tracking-tight text-foreground leading-none">Health <br /> Insights</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Target:</span>
                      <Badge variant="secondary" className="bg-foreground text-white">
                        {user?.healthGoal?.replace('_', ' ') || 'maintenance'}
                      </Badge>
                    </div>
                </div>
                
                <button 
                  id="btn-view-all-recs"
                  className="flex items-center gap-3 text-accent font-black text-xs uppercase tracking-[0.2em] group h-14 px-8 border-2 border-accent rounded-md hover:bg-accent hover:text-white transition-all duration-200"
                >
                  Full Plan 
                  <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.slice(0, 4).map((food, idx) => (
                <div 
                    key={idx} 
                    className="p-8 bg-muted rounded-lg border-2 border-transparent hover:border-accent hover:bg-white transition-all duration-200 group/item"
                >
                    <div className="flex justify-between items-start mb-6 gap-4">
                         <h4 className="text-foreground font-black text-lg uppercase tracking-tight leading-tight group-hover/item:text-accent transition-colors">
                            {food.dish_name}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] font-black text-white bg-accent px-3 py-2 rounded-md shrink-0">
                             <Zap size={12} strokeWidth={3} />
                             {food.calories.toFixed(0)} KCAL
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 border-t-2 border-border/50 pt-6">
                        <div className="space-y-1">
                            <span className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] block">Protein</span>
                            <span className="text-sm font-black text-foreground tracking-tighter">{food.protein.toFixed(1)}G</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] block">Carbs</span>
                            <span className="text-sm font-black text-foreground tracking-tighter">{food.carbohydrates.toFixed(1)}G</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] block">Fats</span>
                            <span className="text-sm font-black text-foreground tracking-tighter">{food.fats.toFixed(1)}G</span>
                        </div>
                    </div>
                </div>
                ))}
            </div>
        </div>
    </div>
  );
}
