'use client';

import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';
import { useState } from 'react';

export default function HealthCharts({ data }) {
  const [activeChart, setActiveChart] = useState('heartRate');

  const healthData = data
    ?.map(item => {
      const d = new Date(item.date);
      return {
        ...item,
        heartRate: item.heartRate ? Number(item.heartRate) : null,
        systolicBp: item.systolicBp ? Number(item.systolicBp) : null,
        sleepHours: item.sleepHours ? Number(item.sleepHours) : null,
        bmi: item.bmi ? Number(item.bmi) : null,
        timestamp: d.getTime(), 
        displayDate: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        displayTime: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        fullDate: d.toLocaleDateString()
      };
    })
    .filter(item => item.heartRate || item.systolicBp || item.sleepHours || item.bmi);

  if (!healthData || healthData.length === 0) {
    return (
      <div className="bg-white rounded-lg p-12 border-4 border-muted text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6 text-4xl">
          📉
        </div>
        <h3 className="text-3xl font-black uppercase tracking-tight text-foreground mb-4">No Data Yet</h3>
        <p className="text-muted-foreground font-medium text-lg max-w-sm leading-snug">
          Input your health logs to generate your health trends.
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-foreground p-5 rounded-md border-2 border-white/10 text-white min-w-[200px]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">{dataPoint.displayDate}</p>
          <p className="text-lg font-black uppercase tracking-tight mb-4 border-b border-white/10 pb-2">{dataPoint.displayTime}</p>
          
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-6 mb-2 last:mb-0">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#0052FF' }} />
                <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">
                  {entry.name === 'systolicBp' ? 'Pressure' : 
                   entry.name === 'heartRate' ? 'Pulse' : 
                   entry.name === 'sleepHours' ? 'Hours' : entry.name}
                </span>
              </div>
              <span className="font-black text-lg tracking-tighter">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatXAxis = (tickItem) => {
      return new Date(tickItem).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const tabs = [
    { id: 'heartRate', label: 'Heart Rate', icon: '💓', color: '#0052FF' },
    { id: 'bp', label: 'Blood Pressure', icon: '🩸', color: '#0052FF' },
    { id: 'bmi', label: 'BMI', icon: '⚖️', color: '#0052FF' },
    { id: 'sleep', label: 'Sleep', icon: '💤', color: '#0052FF' },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex flex-wrap bg-muted p-1.5 rounded-md border-2 border-border w-full md:w-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className={`
                flex-1 md:flex-none px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2
                ${activeChart === tab.id 
                  ? 'bg-foreground text-white' 
                  : 'text-muted-foreground hover:text-foreground'}
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-[400px] w-full p-4 bg-white border-2 border-muted rounded-lg">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={healthData.filter(d => {
              if (activeChart === 'bmi') return d.bmi;
              if (activeChart === 'heartRate') return d.heartRate;
              if (activeChart === 'bp') return d.systolicBp;
              if (activeChart === 'sleep') return d.sleepHours;
              return false;
            }).slice(-7)} 
            margin={{ top: 20, right: 0, left: -20, bottom: 20 }}
            barSize={40}
          >
            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E2E8F0" strokeWidth={2} />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatXAxis}
              axisLine={{ stroke: '#E2E8F0', strokeWidth: 4 }} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }}
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }}
              domain={['dataMin - 10', 'dataMax + 10']}
              dx={-5}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: '#F1F5F9', radius: 4 }}
              animationDuration={200}
            />
            <Bar 
              dataKey={activeChart === 'bp' ? 'systolicBp' : activeChart === 'sleep' ? 'sleepHours' : activeChart}
              fill="#0052FF"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            >
                {healthData.slice(-7).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 6 ? '#0052FF' : '#0052FF'} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
