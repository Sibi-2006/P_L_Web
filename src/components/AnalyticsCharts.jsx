import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import TradingCandleChart from './TradingCandleChart';
import useCurrency from '../hooks/useCurrency';

const AnalyticsCharts = ({ trades }) => {
  const { currency, rate } = useCurrency();
  const currencySymbol = currency === 'INR' ? '₹' : '$';

  const stats = useMemo(() => {
    if (!trades || trades.length === 0) return null;

    const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let grossProfit = 0;
    let grossLoss = 0;
    let winCount = 0;
    let lossCount = 0;
    let biggestWin = 0;
    let biggestLoss = 0;

    let cumulative = 0;
    let peak = 0;
    let maxDrawdown = 0;

    const pairStats = {};
    const dayStats = { 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0, 'Saturday': 0, 'Sunday': 0 };
    const sessionStats = { 'Asian': 0, 'London': 0, 'New York': 0 };

    sorted.forEach(t => {
      const rawAmount = Number(t.amount) || 0;
      const typeStr = (t.trade_type || t.type || '').toUpperCase();
      const isProfit = typeStr === 'PROFIT' || (typeStr !== 'LOSS' && rawAmount >= 0);
      const pnl = isProfit ? Math.abs(rawAmount) : -Math.abs(rawAmount);
      
      const convertedPnl = pnl * rate;

      if (isProfit) {
        winCount++;
        grossProfit += convertedPnl;
        if (convertedPnl > biggestWin) biggestWin = convertedPnl;
      } else {
        lossCount++;
        grossLoss += Math.abs(convertedPnl);
        if (Math.abs(convertedPnl) > biggestLoss) biggestLoss = Math.abs(convertedPnl);
      }

      // Drawdown
      cumulative += convertedPnl;
      if (cumulative > peak) peak = cumulative;
      const drawdown = peak - cumulative;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;

      // Pair Stats
      const pair = t.pair || 'Unknown';
      if (!pairStats[pair]) pairStats[pair] = 0;
      pairStats[pair] += convertedPnl;

      // Day of Week
      const dayName = new Date(t.date).toLocaleDateString('en-US', { weekday: 'long' });
      if (dayStats[dayName] !== undefined) dayStats[dayName] += convertedPnl;

      // Session (Simplified based on hour)
      const time = t.entry_time || t.entryTime;
      if (time) {
        const hour = parseInt(time.split(':')[0], 10);
        if (hour >= 0 && hour < 8) sessionStats['Asian'] += convertedPnl;
        else if (hour >= 8 && hour < 14) sessionStats['London'] += convertedPnl;
        else sessionStats['New York'] += convertedPnl;
      }
    });

    const totalTrades = winCount + lossCount;
    const winRate = totalTrades > 0 ? ((winCount / totalTrades) * 100).toFixed(1) : 0;
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (grossProfit > 0 ? '∞' : '0');
    const avgWin = winCount > 0 ? grossProfit / winCount : 0;
    const avgLoss = lossCount > 0 ? grossLoss / lossCount : 0;

    let bestPair = 'N/A';
    let bestPairProfit = -Infinity;
    Object.entries(pairStats).forEach(([pair, pnl]) => {
      if (pnl > bestPairProfit) {
        bestPairProfit = pnl;
        bestPair = pair;
      }
    });

    return {
      winRate, profitFactor, avgWin, avgLoss, biggestWin, biggestLoss, maxDrawdown,
      bestPair, bestPairProfit, winCount, lossCount, sessionStats, dayStats, pairStats
    };
  }, [trades, rate]);

  if (!stats) return <div className="p-4 border-4 border-black bg-white font-mono font-bold text-center">NO DATA TO DISPLAY ANALYTICS</div>;

  const winLossData = [
    { name: 'Wins', value: stats.winCount, fill: '#00FF66' },
    { name: 'Losses', value: stats.lossCount, fill: '#FF4949' }
  ];

  return (
    <div className="flex flex-col gap-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TradingCandleChart trades={trades} currency={currency} rate={rate} />
        </div>
        
        {/* Advanced KPI Stats */}
        <div className="border-4 border-black bg-white dark:bg-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 font-mono flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-black uppercase mb-4 border-b-4 border-black pb-2 text-black dark:text-white">Professional Metrics</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-100 dark:bg-zinc-800 p-3 border-2 border-black">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Win Rate</p>
                <p className="text-2xl font-black text-black dark:text-white">{stats.winRate}%</p>
              </div>
              <div className="bg-gray-100 dark:bg-zinc-800 p-3 border-2 border-black">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Profit Factor</p>
                <p className="text-2xl font-black text-black dark:text-white">{stats.profitFactor}</p>
              </div>
              <div className="bg-[#00FF66] p-3 border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-[10px] font-bold uppercase">Avg Win</p>
                <p className="text-xl font-black">{currencySymbol}{stats.avgWin.toFixed(2)}</p>
              </div>
              <div className="bg-[#FF4949] p-3 border-2 border-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-[10px] font-bold uppercase">Avg Loss</p>
                <p className="text-xl font-black">{currencySymbol}{stats.avgLoss.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="bg-yellow-300 p-3 border-2 border-black text-black mb-4 flex justify-between items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div>
                <p className="text-[10px] font-bold uppercase">Max Drawdown</p>
                <p className="text-xl font-black text-red-600">-{currencySymbol}{stats.maxDrawdown.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase">Best Pair</p>
                <p className="text-xl font-black">{stats.bestPair}</p>
              </div>
            </div>
          </div>
          
          <div>
             <h2 className="text-sm font-black uppercase mb-2 border-b-2 border-black pb-1 text-black dark:text-white">Win/Loss Ratio</h2>
             <div className="h-24 w-full flex">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={winLossData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tick={{fontFamily: 'Space Mono', fontWeight: 'bold', fill: 'gray', fontSize: 10}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: 0, border: '4px solid black', fontFamily: 'Space Mono', fontWeight: 'bold', color: 'black' }} />
                    <Bar dataKey="value" stroke="#000" strokeWidth={2}>
                      {winLossData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>
      
      {/* Session & Days Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border-4 border-black bg-white dark:bg-zinc-900 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-mono">
           <h2 className="text-xl font-black uppercase mb-4 border-b-4 border-black pb-2 text-black dark:text-white">Session Performance</h2>
           <div className="grid grid-cols-3 gap-4">
             {Object.entries(stats.sessionStats).map(([session, pnl]) => (
               <div key={session} className={`border-2 border-black p-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform cursor-default ${pnl >= 0 ? 'bg-[#00FF66] text-black' : 'bg-[#FF4949] text-white'}`}>
                  <p className="text-xs font-bold uppercase mb-1">{session}</p>
                  <p className="text-xl font-black">{pnl >= 0 ? '+' : '-'}{currencySymbol}{Math.abs(pnl).toFixed(2)}</p>
               </div>
             ))}
           </div>
        </div>

        <div className="border-4 border-black bg-white dark:bg-zinc-900 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-mono">
           <h2 className="text-xl font-black uppercase mb-4 border-b-4 border-black pb-2 text-black dark:text-white">Day of Week Performance</h2>
           <div className="flex gap-2 overflow-x-auto pb-2">
             {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
               const pnl = stats.dayStats[day] || 0;
               return (
                 <div key={day} className={`flex-1 min-w-[70px] border-2 border-black p-3 text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform cursor-default ${pnl > 0 ? 'bg-[#00FF66] text-black' : pnl < 0 ? 'bg-[#FF4949] text-white' : 'bg-gray-100 dark:bg-zinc-800 text-black dark:text-white'}`}>
                    <p className="text-[10px] font-bold uppercase mb-1">{day.slice(0,3)}</p>
                    <p className="text-sm font-black">{pnl > 0 ? '+' : (pnl < 0 ? '-' : '')}{currencySymbol}{Math.abs(pnl).toFixed(0)}</p>
                 </div>
               )
             })}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
