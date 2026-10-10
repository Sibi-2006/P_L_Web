import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useCurrency from '../hooks/useCurrency';

export default function ShareableReportPage() {
  const [trades, setTrades] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  
  const { currency, rate } = useCurrency();
  const currencySymbol = currency === 'INR' ? '₹' : '$';

  useEffect(() => {
    fetchTrades();
  }, [month, year]);

  const fetchTrades = async () => {
    const { data } = await supabase.from('trades').select('*').order('date', { ascending: false });
    if (data) {
      const filtered = data.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });
      setTrades(filtered);
    }
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
  const pf = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (grossProfit > 0 ? '∞' : '0');

  return (
    <div className="max-w-4xl mx-auto p-6 font-mono pb-12">
      <div className="flex justify-between items-center mb-8 border-b-8 border-black pb-4">
        <h1 className="text-4xl font-black uppercase text-black dark:text-white">
          📈 Public Report
        </h1>
        <div className="flex gap-2">
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="border-4 border-black p-2 font-bold uppercase bg-white text-black focus:outline-none">
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="border-4 border-black p-2 font-bold uppercase bg-white text-black focus:outline-none">
            {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      
      <div id="report-card" className="border-4 border-black bg-white p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-black">
         <div className="flex justify-between items-center mb-6">
           <div>
             <h2 className="text-3xl font-black uppercase">Trading Performance</h2>
             <p className="text-lg font-bold text-gray-500 uppercase">{['January','February','March','April','May','June','July','August','September','October','November','December'][month]} {year}</p>
           </div>
           <div className={`border-4 border-black p-4 text-center ${netPnL >= 0 ? 'bg-[#00FF66]' : 'bg-[#FF4949] text-white'}`}>
              <p className="text-xs font-black uppercase tracking-widest mb-1">Monthly Net P&L</p>
              <p className="text-4xl font-black">{netPnL >= 0 ? '+' : '-'}{currencySymbol}{Math.abs(netPnL).toFixed(2)}</p>
           </div>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="border-2 border-black bg-gray-100 p-4">
              <p className="text-[10px] font-black uppercase text-gray-500">Win Rate</p>
              <p className="text-2xl font-black">{winRate}%</p>
            </div>
            <div className="border-2 border-black bg-gray-100 p-4">
              <p className="text-[10px] font-black uppercase text-gray-500">Profit Factor</p>
              <p className="text-2xl font-black">{pf}</p>
            </div>
            <div className="border-2 border-black bg-gray-100 p-4">
              <p className="text-[10px] font-black uppercase text-gray-500">Total Trades</p>
              <p className="text-2xl font-black">{trades.length}</p>
            </div>
            <div className="border-2 border-black bg-gray-100 p-4 flex justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-green-700">Wins</p>
                <p className="text-xl font-black">{wins}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-red-600">Losses</p>
                <p className="text-xl font-black">{losses}</p>
              </div>
            </div>
         </div>

         <div className="bg-black text-white p-4 text-center border-4 border-black font-black uppercase">
            Powered by Antigravity Trading Journal
         </div>
      </div>
      
      <div className="mt-8 text-center">
         <button onClick={() => window.print()} className="bg-[#FFE600] text-black border-4 border-black px-8 py-3 font-black text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform cursor-pointer">
            PRINT / SAVE AS PDF
         </button>
      </div>
    </div>
  );
}
