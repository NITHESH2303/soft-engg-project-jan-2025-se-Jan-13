// WeekSelector.tsx
import React from 'react';

interface WeekSelectorProps {
  weekNo: number;
  setWeekNo: React.Dispatch<React.SetStateAction<number>>;
}

export default function WeekSelector({ weekNo, setWeekNo }: WeekSelectorProps) {
  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Week Number</h3>
      <input
        type="number"
        value={weekNo}
        onChange={(e) => setWeekNo(parseInt(e.target.value) || 1)}
        className="w-full p-2 border rounded"
        min="1"
      />
    </div>
  );
}

