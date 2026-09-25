import React, { useMemo } from 'react';

const CalendarGrid = ({ trades, currencyRate, useInr }) => {
  const formatMoney = (amount) => {
    if (useInr && currencyRate) {
      return `₹${(amount * currencyRate).toFixed(0)}`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const calendarData = useMemo(() => {
    // Generate dates for current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday

    const days = [];
    
    // Group trades by date string (YYYY-MM-DD)
    const tradesByDate = trades.reduce((acc, trade) => {
      const dateStr = new Date(trade.date).toISOString().split('T')[0];
      if (!acc[dateStr]) acc[dateStr] = 0;
      acc[dateStr] += trade.type === 'profit' ? trade.amount : -trade.amount;
      return acc;
    }, {});

    // Padding for first week
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = new Date(Date.UTC(year, month, i)).toISOString().split('T')[0];
      const pnl = tradesByDate[dateStr] || 0;
      days.push({
        day: i,
        date: dateStr,
        pnl,
        hasTrade: tradesByDate.hasOwnProperty(dateStr)
      });
    }
    return days;
  }, [trades]);

  const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="brutalist-card p-6 bg-white mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black uppercase">P&L Calendar</h2>
        <span className="font-bold border-2 border-black px-3 py-1 bg-brutal-yellow uppercase">
          {monthName}
        </span>
      </div>
      
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-black uppercase text-xs md:text-sm">{day}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {calendarData.map((d, i) => {
          if (!d) return <div key={i} className="aspect-square bg-gray-100 border-2 border-transparent"></div>;
          
          let bgColor = 'bg-white';
          if (d.hasTrade) {
            bgColor = d.pnl >= 0 ? 'bg-brutal-mint text-black' : 'bg-brutal-coral text-white';
          }

          return (
            <div 
              key={i} 
              className={`aspect-square border-2 border-black flex flex-col justify-between p-1 md:p-2 cursor-pointer hover:-translate-y-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform ${bgColor}`}
            >
              <span className="font-black text-xs md:text-sm">{d.day}</span>
              {d.hasTrade && (
                <span className="font-bold text-[10px] md:text-xs text-right break-all">
                  {d.pnl > 0 ? '+' : ''}{formatMoney(d.pnl)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
