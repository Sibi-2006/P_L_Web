import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useCurrency from '../hooks/useCurrency';

export default function WeeklyReviewPage() {
  const [trades, setTrades] = useState([]);
  const [reflection, setReflection] = useState(localStorage.getItem('weeklyReflection') || '');
  const { currency, rate } = useCurrency();
  const currencySymbol = currency === 'INR' ? '₹' : '$';

  useEffect(() => {
    fetchWeeklyTrades();
  }, []);

  const fetchWeeklyTrades = async () => {
    const { data } = await supabase.from('trades').select('*').order('date', { ascending: false });
    if (data) {
      const now = new Date();
      const pastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const filtered = data.filter(t => new Date(t.date) >= pastWeek);
      setTrades(filtered);
    }
  };

  const handleSave = () => {
    localStorage.setItem('weeklyReflection', reflection);
    alert('Weekly reflection saved locally!');
  };

  let wins = 0, losses = 0, grossProfit = 0, grossLoss = 0;
  trades.forEach(t => {
    const type = (t.trade_type || t.type || '').toUpperCase();
    const isProfit = type === 'PROFIT' || (type !== 'LOSS' && Number(t.amount) >= 0);
    const pnl = Math.abs(Number(t.amount)) * rate;
    
    if (isProfit) {
      wins++;
      grossProfit += pnl;
    } else {
      losses++;
      grossLoss += pnl;
    }
  });

  const netPnL = grossProfit - grossLoss;
  const winRate = trades.length > 0 ? ((wins / trades.length) * 100).toFixed(1) : 0;

  return (
    <div className="max-w-5xl mx-auto p-6 font-mono pb-12">
      <h1 className="text-4xl font-black uppercase mb-8 border-b-8 border-black pb-4 text-black dark:text-white">
        📅 Weekly Review
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="border-4 border-black p-6 bg-[#FFE600] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-black">
          <h2 className="text-2xl font-black uppercase mb-4 border-b-2 border-black pb-2">Last 7 Days Stats</h2>
          <div className="flex flex-col gap-2">
             <div className="flex justify-between font-bold text-lg border-b border-black border-dashed pb-1"><span>Net P&L:</span> <span>{netPnL >= 0 ? '+' : '-'}{currencySymbol}{Math.abs(netPnL).toFixed(2)}</span></div>
             <div className="flex justify-between font-bold text-lg border-b border-black border-dashed pb-1"><span>Win Rate:</span> <span>{winRate}%</span></div>
             <div className="flex justify-between font-bold text-lg border-b border-black border-dashed pb-1"><span>Trades Taken:</span> <span>{trades.length}</span></div>
             <div className="flex justify-between font-bold text-lg border-b border-black border-dashed pb-1 text-green-700"><span>Wins:</span> <span>{wins}</span></div>
             <div className="flex justify-between font-bold text-lg text-red-600"><span>Losses:</span> <span>{losses}</span></div>
          </div>
        </div>

        <div className="border-4 border-black p-6 bg-white dark:bg-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-xl font-black uppercase mb-4 text-black dark:text-white">🧠 Reflection & Lessons</h2>
          <textarea 
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="w-full h-40 border-4 border-black p-4 font-bold text-black focus:outline-none focus:bg-yellow-100 resize-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            placeholder="What went well this week? Did you follow your rules? What needs improvement?"
          ></textarea>
          <button 
            onClick={handleSave}
            className="w-full mt-4 bg-black text-white py-3 border-4 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 transition-transform cursor-pointer"
          >
            Save Reflection
          </button>
        </div>
      </div>
    </div>
  );
}
