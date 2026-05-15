'use client';

import React, { useState } from 'react';
import { Search, Plus, Trash2, Utensils, Dumbbell, Droplets, ArrowRight } from 'lucide-react';

export default function NativeBatchLogger({ meals, setMeals, exercises, setExercises, waterIntake, setWaterIntake }) {
  const [foodSearchResults, setFoodSearchResults] = useState([]);
  const [activeSearchIndex, setActiveSearchIndex] = useState(null);

  const handleFoodSearch = async (query, index) => {
    setActiveSearchIndex(index);
    if (query.length < 2) {
      setFoodSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/ml/food/search?q=${query}`);
      const data = await res.json();
      setFoodSearchResults(data);
    } catch (error) {
      console.error('Food search error:', error);
    }
  };

  const selectFood = (index, food) => {
    const newMeals = [...meals];
    newMeals[index] = {
      ...newMeals[index],
      dishName: food.dish_name,
      calories: food.calories || 0,
      protein: food.protein || 0,
      carbs: food.carbohydrates || 0,
      fats: food.fats || 0
    };
    setMeals(newMeals);
    setFoodSearchResults([]);
    setActiveSearchIndex(null);
  };

  const updateMeal = (index, field, value) => {
    const newMeals = [...meals];
    newMeals[index][field] = value;
    setMeals(newMeals);
  };

  const addMeal = () => setMeals([...meals, { dishName: '', calories: '', protein: '', carbs: '', fats: '', type: 'snack' }]);
  const removeMeal = (index) => setMeals(meals.filter((_, i) => i !== index));

  const updateExercise = (index, field, value) => {
    const newEx = [...exercises];
    newEx[index][field] = value;
    setExercises(newEx);
  };

  const addExercise = () => setExercises([...exercises, { activity: '', duration: '', caloriesBurned: '' }]);
  const removeExercise = (index) => setExercises(exercises.filter((_, i) => i !== index));

  // Premium Design Tokens
  const inputBase = "w-full bg-slate-50 border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-bold text-[var(--foreground)] focus:bg-white focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/5 transition-all outline-none placeholder:text-slate-300";
  const labelBase = "text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-[0.2em] mb-2 block ml-1";

  return (
    <div className="space-y-12 animate-fadeIn">
      
      {/* 🍽️ SECTION: NUTRITION */}
      <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100">
                <Utensils size={18} />
             </div>
             <div>
                <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest">Meal Log</h3>
                <p className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Track your meals and calories</p>
             </div>
          </div>

          <div className="space-y-4">
            {meals.map((meal, index) => (
                <div key={index} className="group relative bg-white border border-[var(--border)] rounded-[16px] p-5 lg:p-6 hover:border-[var(--accent)]/30 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
                        <div className="col-span-12 lg:col-span-5 relative">
                            <label className={labelBase}>Meal Name</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-[var(--accent)] transition-colors" size={16} />
                                <input
                                    id={`input-meal-name-${index}`}
                                    type="text"
                                    placeholder="Search for food..."
                                    value={meal.dishName}
                                    onChange={(e) => {
                                        updateMeal(index, 'dishName', e.target.value);
                                        handleFoodSearch(e.target.value, index);
                                    }}
                                    className={`${inputBase} pl-12`}
                                />
                            </div>
                            
                            {activeSearchIndex === index && foodSearchResults.length > 0 && (
                                <div className="absolute z-[100] left-0 right-0 mt-3 bg-white border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto animate-fadeIn group-hover:border-[var(--accent)]/20">
                                    <div className="p-3 bg-slate-50 border-b border-[var(--border)]">
                                        <p className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">Search Results</p>
                                    </div>
                                    {foodSearchResults.map((food, fi) => (
                                        <button 
                                            type="button"
                                            key={fi} 
                                            onClick={() => selectFood(index, food)} 
                                            className="w-full text-left p-4 hover:bg-slate-50 border-b border-[var(--border)] last:border-0 flex items-center justify-between group/item transition-colors"
                                        >
                                            <div className="space-y-1">
                                                <span className="font-bold text-sm text-[var(--foreground)] group-hover/item:text-[var(--accent)] transition-colors uppercase tracking-wide">{food.dish_name}</span>
                                                <div className="flex gap-2">
                                                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter bg-emerald-50 px-1.5 py-0.5 rounded-md">{food.calories} kcal</span>
                                                    {Number(food.protein) > 10 && <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-tighter bg-indigo-50 px-1.5 py-0.5 rounded-md">High Protein</span>}
                                                </div>
                                            </div>
                                            <ArrowRight size={14} className="text-slate-300 group-hover/item:text-[var(--accent)] group-hover/item:translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="col-span-6 lg:col-span-2">
                             <label className={labelBase}>Calories (kcal)</label>
                            <input id={`input-meal-cal-${index}`} type="number" value={meal.calories} onChange={(e) => updateMeal(index, 'calories', e.target.value)} className={`${inputBase} text-center font-mono`} />
                        </div>
                        
                        <div className="col-span-6 lg:col-span-2">
                            <label className={labelBase}>Protein (g)</label>
                            <input id={`input-meal-prot-${index}`} type="number" value={meal.protein} onChange={(e) => updateMeal(index, 'protein', e.target.value)} className={`${inputBase} text-center font-mono`} />
                        </div>
                        
                        <div className="col-span-12 lg:col-span-3 flex items-end gap-3">
                            <div className="flex-1">
                                <label className={labelBase}>Meal Type</label>
                                <select 
                                    id={`input-meal-type-${index}`} 
                                    value={meal.type} 
                                    onChange={(e) => updateMeal(index, 'type', e.target.value)} 
                                    className={`${inputBase} cursor-pointer appearance-none uppercase tracking-widest text-[10px] px-5`}
                                >
                                    {['breakfast','lunch','dinner','snack'].map(t=><option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => removeMeal(index)} 
                                className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            
            <button 
                type="button" 
                id="btn-add-meal" 
                onClick={addMeal} 
                className="w-full py-4 border-2 border-dashed border-[var(--border)] rounded-[16px] text-[var(--muted-foreground)] font-bold hover:border-[var(--accent)]/40 hover:text-[var(--accent)] hover:bg-slate-50 transition-all text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3"
            >
                <Plus size={14} />
                Add Meal
            </button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-12 border-t border-[var(--border)]">
          
          {/* 💧 SECTION: WATER */}
          <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 shadow-sm border border-blue-100">
                      <Droplets size={18} />
                   </div>
                   <div>
                      <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest">Water Log</h3>
                      <p className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Track your water intake</p>
                   </div>
                </div>
                <div className="flex gap-2">
                    {[250, 500].map(v => (
                        <button 
                            type="button"
                            key={v} 
                            onClick={() => setWaterIntake(prev => (Number(prev)||0) + v)} 
                            className="px-3 py-1.5 bg-white text-blue-600 text-[9px] font-bold rounded-lg border border-blue-100 hover:border-blue-600 hover:bg-blue-600 hover:text-white transition-all uppercase tracking-widest"
                        >
                            +{v}ml
                        </button>
                    ))}
                </div>
              </div>

              <div className="relative gradient-border">
                  <div className="bg-white rounded-[10px] p-6">
                      <label className={labelBase}>Amount (ml)</label>
                      <div className="relative">
                        <input
                            id="input-water"
                            type="number"
                            value={waterIntake}
                            onChange={(e) => setWaterIntake(e.target.value)}
                            className={`${inputBase} h-14 text-center text-lg font-mono text-blue-600`}
                        />
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                         <p className="text-[8px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">Daily Goal</p>
                         <p className="text-[9px] font-bold text-[var(--foreground)]">2500 ML</p>
                      </div>
                  </div>
              </div>
          </div>

          {/* 🏋️ SECTION: ACTIVITY */}
          <div className="space-y-6">
              <div className="flex items-center gap-3 h-10">
                 <div className="w-9 h-9 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500 shadow-sm border border-rose-100">
                    <Dumbbell size={18} />
                 </div>
                 <div>
                    <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-widest">Exercise Log</h3>
                    <p className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Track your activity</p>
                 </div>
              </div>

              <div className="space-y-4">
                  {exercises.map((ex, exIndex) => (
                      <div key={exIndex} className="bg-slate-50/50 border border-[var(--border)] rounded-2xl p-4 flex gap-4 items-end hover:border-[var(--accent)]/20 transition-colors">
                          <div className="flex-1">
                            <label className={labelBase}>Activity</label>
                            <input type="text" placeholder="e.g. Running" value={ex.activity} onChange={(e)=>updateExercise(exIndex,'activity',e.target.value)} className={inputBase} />
                          </div>
                          <div className="w-24">
                             <label className={labelBase}>Duration</label>
                             <div className="relative">
                                <input type="number" placeholder="0" value={ex.duration} onChange={(e)=>updateExercise(exIndex,'duration',e.target.value)} className={`${inputBase} text-center font-mono`} />
                                <span className="absolute right-3 top-1/2 -track-y-1/2 text-[8px] font-bold text-slate-300">Min</span>
                             </div>
                          </div>
                          <button type="button" onClick={()=>removeExercise(exIndex)} className="w-11 h-11 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors rounded-xl"><Trash2 size={16} /></button>
                      </div>
                  ))}
                  
                  <button 
                    type="button" 
                    onClick={addExercise} 
                    className="w-full py-4 bg-white border border-[var(--border)] rounded-2xl text-[9px] font-bold text-[var(--muted-foreground)] hover:text-[var(--accent)] hover:border-[var(--accent)]/20 uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={12} />
                    Add Activity
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
}
