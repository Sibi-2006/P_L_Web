import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TradingCandleChart({ trades = [], currency = 'USD', rate = 1 }) {
  const [hoveredTrade, setHoveredTrade] = useState(null);
  const navigate = useNavigate();

  if (!trades || trades.length === 0) {
    return (
      <div className="border-4 border-black bg-white dark:bg-zinc-900 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-mono text-center">
        <h3 className="text-lg font-black uppercase text-black dark:text-white mb-1">📈 CUMULATIVE P&L CHART</h3>
        <p className="text-xs font-bold text-gray-500">No trades recorded yet.</p>
      </div>
    );
  }

  // Sort trades chronologically
  const sortedTrades = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));

  let runningBalance = 0;
  const chartData = sortedTrades.map((trade, index) => {
    const rawAmount = Number(trade.amount) || 0;
    const typeStr = (trade.trade_type || trade.type || '').toUpperCase();
    
    const isProfit = typeStr === 'PROFIT' || (typeStr !== 'LOSS' && rawAmount >= 0);
    const pnl = isProfit ? Math.abs(rawAmount) : -Math.abs(rawAmount);

    const startBalance = runningBalance;
    runningBalance += pnl;

    const convertedPnl = currency === 'INR' ? Math.abs(pnl) * rate : Math.abs(pnl);
    const currencySymbol = currency === 'INR' ? '₹' : '$';

    return {
      id: trade.id || trade._id,
      index: index + 1,
      date: trade.date, // Raw date for comparison
      displayDate: new Date(trade.date).toLocaleDateString('en-GB'),
      pair: trade.pair || 'XAUUSD',
      isProfit,
      pnl,
      startBalance,
      endBalance: runningBalance,
      formattedAmount: `${isProfit ? '+' : '-'}${currencySymbol}${convertedPnl.toFixed(2)}`,
    };
  });

  const handleCandleClick = (clickedTrade) => {
    // Straightly open the clicked trade
    const tradeId = clickedTrade.id || clickedTrade._id;
    navigate(`/trade/${tradeId}`);
  };

  const balances = chartData.map(d => d.endBalance).concat(chartData.map(d => d.startBalance), [0]);
  const minBal = Math.min(...balances);
  const maxBal = Math.max(...balances);
  const range = maxBal - minBal || 100;

  const getTopPercent = (val) => ((maxBal - val) / range) * 80 + 10;

  return (
    <div className="border-4 border-black bg-white dark:bg-zinc-900 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-mono relative">
      <div className="flex justify-between items-center mb-4 pb-3 border-b-3 border-black">
        <div>
          <h3 className="text-lg font-black uppercase text-black dark:text-white flex items-center gap-2">
            📈 CUMULATIVE P&L TIMELINE
          </h3>
          <p className="text-[11px] font-bold text-gray-500">Click any candle to inspect trade(s)</p>
        </div>
        {hoveredTrade && (
          <div className="bg-black text-white px-3 py-1 border-2 border-black text-xs font-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            #{hoveredTrade.index} | {hoveredTrade.pair} | <span className={hoveredTrade.isProfit ? 'text-[#00FF66]' : 'text-[#FF4949]'}>{hoveredTrade.formattedAmount}</span>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="h-72 border-2 border-black bg-zinc-950 p-4 relative flex items-center justify-between gap-3 overflow-x-auto">
        {chartData.map((item) => {
          const topPos = Math.min(getTopPercent(item.startBalance), getTopPercent(item.endBalance));
          const heightVal = Math.max(Math.abs(getTopPercent(item.endBalance) - getTopPercent(item.startBalance)), 6);

          return (
            <div
              key={item.id}
              onClick={() => handleCandleClick(item)}
              onMouseEnter={() => setHoveredTrade(item)}
              onMouseLeave={() => setHoveredTrade(null)}
              className="flex-1 h-full relative group cursor-pointer min-w-[36px]"
              title={`Click to view trade #${item.index} (${item.displayDate})`}
            >
              <div
                style={{
                  top: `${topPos}%`,
                  height: `${heightVal}%`,
                }}
                className={`absolute w-full border-2 border-black transition-transform duration-150 group-hover:scale-105 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                  item.isProfit ? 'bg-[#00FF66]' : 'bg-[#FF4949]'
                }`}
              ></div>

              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold text-zinc-400">
                #{item.index}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-between items-center mt-4 text-xs font-black">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5 text-black dark:text-white">
            <span className="w-3 h-3 bg-[#00FF66] border border-black inline-block"></span> PROFIT
          </span>
          <span className="flex items-center gap-1.5 text-black dark:text-white">
            <span className="w-3 h-3 bg-[#FF4949] border border-black inline-block"></span> LOSS
          </span>
        </div>
        <span className="text-gray-500 text-[11px]">TOTAL TRADES: {chartData.length}</span>
      </div>
    </div>
  );
}
