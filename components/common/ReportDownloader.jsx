"use client";

import { useState } from 'react';
import { FileDown, Calendar } from 'lucide-react';
import Button from './Button';

export default function ReportDownloader() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const download = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/user/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: startDate || null, endDate: endDate || null }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Failed to generate PDF');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `fitnest-report-${startDate || 'start'}_to_${endDate || 'end'}.pdf`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[var(--border)] rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white shadow-accent">
          <FileDown size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--foreground)]">Download Report</h3>
          <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">PDF Export</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1 space-y-1.5 w-full">
          <label className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-[0.15em] ml-1">From</label>
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              type="date" 
              className="w-full bg-white border border-[var(--border)] rounded-xl px-4 py-2.5 pl-9 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/50 focus:ring-4 focus:ring-[var(--accent)]/5 outline-none transition-all" 
            />
          </div>
        </div>
        <div className="flex-1 space-y-1.5 w-full">
          <label className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-[0.15em] ml-1">To</label>
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              type="date" 
              className="w-full bg-white border border-[var(--border)] rounded-xl px-4 py-2.5 pl-9 text-sm text-[var(--foreground)] focus:border-[var(--accent)]/50 focus:ring-4 focus:ring-[var(--accent)]/5 outline-none transition-all" 
            />
          </div>
        </div>
        <Button 
          onClick={download} 
          disabled={loading} 
          loading={loading}
          size="md"
          className="w-full sm:w-auto whitespace-nowrap shadow-accent"
        >
          <FileDown size={16} className="mr-2" />
          Download
        </Button>
      </div>
      
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      <p className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Leave dates empty for last 30 days</p>
    </div>
  );
}
