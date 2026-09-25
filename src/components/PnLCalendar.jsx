import React, { useState } from 'react';

export default function PnLCalendar({ trades, selectedDate, onSelectMonth, currency = 'USD', rate = 1 }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleMonthChange = (e) => {
    const newMonthIndex = parseInt(e.target.value);
    const updated = new Date(currentDate.getFullYear(), newMonthIndex, 1);
    setCurrentDate(updated);
    if (onSelectMonth) onSelectMonth(updated);
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    const updated = new Date(newYear, currentDate.getMonth(), 1);
    setCurrentDate(updated);
    if (onSelectMonth) onSelectMonth(updated);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Aggregate daily totals
  const dailyPnL = {};
  trades?.forEach((t) => {
    const d = new Date(t.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const dayNum = d.getDate();
      const val = (t.tradeType === 'LOSS' || t.type === 'loss') ? -Math.abs(t.amount) : Math.abs(t.amount);
      dailyPnL[dayNum] = (dailyPnL[dayNum] || 0) + val;
    }
  });

  return (
    <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-mono">
      {/* Header with Month & Year Selectors */}
      <div className="flex justify-between items-center mb-6 gap-2">
        <h2 className="text-xl font-black uppercase">P&L Calendar</h2>
        
        <div className="flex gap-2">
          {/* Month Dropdown */}
          <select
            value={month}
            onChange={handleMonthChange}
            className="border-3 border-black bg-yellow-300 font-black px-3 py-1 uppercase text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none cursor-pointer"
          >
            {months.map((m, idx) => (
              <option key={m} value={idx}>{m}</option>
            ))}
          </select>

          {/* Year Dropdown */}
          <select
            value={year}
            onChange={handleYearChange}
            className="border-3 border-black bg-yellow-300 font-black px-3 py-1 uppercase text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none cursor-pointer"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center font-black text-xs uppercase mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="p-1 border-b-2 border-black">{d}</div>
        ))}
      </div>

      {/* Calendar Day Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Blank Padding Days */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[50px] bg-gray-100 border-2 border-dashed border-gray-300" />
        ))}

        {/* Month Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const pnl = dailyPnL[dayNum];
          const hasTrade = pnl !== undefined;
          const isProfit = pnl >= 0;
          const displayPnl = hasTrade ? pnl * (currency === 'INR' ? rate : 1) : 0;
          const symbol = currency === 'INR' ? '₹' : '$';

          return (
            <div
              key={dayNum}
              className={`min-h-[55px] p-1 border-2 border-black flex flex-col justify-between transition-all ${
                hasTrade
                  ? pnl > 0
                    ? 'bg-[#00FF66] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : pnl < 0
                    ? 'bg-[#FF4949] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-black'
                  : 'bg-white text-black'
              }`}
            >
              {/* Top Row: Day Date */}
              <span className="text-xs font-black">{dayNum}</span>

              {/* Bottom Row: P&L Amount */}
              {hasTrade && (
                <span className="text-[11px] font-black leading-none tracking-tighter truncate text-center block mb-0.5">
                  {pnl > 0 ? '+' : pnl < 0 ? '-' : ''}{symbol}{Math.abs(displayPnl).toFixed(0)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
