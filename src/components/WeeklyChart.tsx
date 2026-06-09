import { useEffect } from 'react';

export default function WeeklyChart() {
  useEffect(() => {
    // Weekly chart data will be loaded from props later
  }, []);

  return (
    <div className="card p-6">
      <div className="flex justify-between mb-4">
        <h3 className="font-semibold">This Week</h3>
        <span className="text-sm text-brand-600">0 min</span>
      </div>
      <div className="text-center text-surface-400 py-8">
        Complete practice to see weekly progress
      </div>
    </div>
  );
}
