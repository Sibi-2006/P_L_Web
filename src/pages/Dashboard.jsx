import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import PnLCalendar from '../components/PnLCalendar';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { useOutletContext } from 'react-router-dom';
import useCurrency from '../hooks/useCurrency';
import { AlertTriangle, TrendingUp, ShieldAlert, Target } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [trades, setTrades] = useState([]);
  const [timeframe, setTimeframe] = useState('all'); // 'week', 'month', 'all'
  const [showClearModal, setShowClearModal] = useState(false);
  
  // Risk Management Goals & Limits
  const [monthlyGoal, setMonthlyGoal] = useState(() => Number(localStorage.getItem('monthlyGoal')) || 10000);
  const [dailyLossLimit, setDailyLossLimit] = useState(() => Number(localStorage.getItem('dailyLossLimit')) || 500);

  // Use context if provided by MainLayout, otherwise fallback to hook
  const outletContext = useOutletContext();
  const { currency: contextCurrency } = outletContext || {};
  const { currency: hookCurrency, rate } = useCurrency();
  const currency = contextCurrency || hookCurrency;
  const currencySymbol = currency === 'INR' ? '₹' : '$';

  const fetchData = useCallback(async () => {
    try {
      const { data: tradesRes, error } = await supabase
        .from('trades')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTrades(tradesRes.map(t => ({
        ...t,
        imageUrl: t.image_url,
        entryTime: t.entry_time,
        exitTime: t.exit_time,
        type: t.trade_type?.toLowerCase()
      })));
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const handleTradeAdded = () => fetchData();
    window.addEventListener('tradeAdded', handleTradeAdded);
    return () => window.removeEventListener('tradeAdded', handleTradeAdded);
  }, [fetchData]);

  // Persist Goals
  useEffect(() => {
    localStorage.setItem('monthlyGoal', monthlyGoal);
    localStorage.setItem('dailyLossLimit', dailyLossLimit);
  }, [monthlyGoal, dailyLossLimit]);

  const filteredTrades = useMemo(() => {
    if (timeframe === 'all') return trades;
    const now = new Date();
    return trades.filter(t => {
      const date = new Date(t.date);
      if (timeframe === 'month') {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
      if (timeframe === 'week') {
        const pastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date >= pastWeek;
      }
      return true;
    });
  }, [trades, timeframe]);

  const stats = useMemo(() => {
    let totalProfit = 0, totalLoss = 0, profitTrades = 0, lossTrades = 0;
    filteredTrades.forEach(t => {
      if (t.type === 'profit') {
        totalProfit += t.amount;
        profitTrades++;
      } else {
        totalLoss += t.amount;
        lossTrades++;
      }
    });
    return {
      totalProfit,
      totalLoss,
      netPnL: totalProfit - totalLoss,
      profitTrades,
      lossTrades,
      totalTrades: filteredTrades.length,
      winRate: filteredTrades.length ? ((profitTrades / filteredTrades.length) * 100).toFixed(1) : 0
    };
  }, [filteredTrades]);

  // Daily Loss Check
  const todayPnL = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let pnl = 0;
    trades.forEach(t => {
      if (t.date === todayStr) {
        pnl += t.type === 'profit' ? t.amount : -t.amount;
      }
    });
    return pnl * rate;
  }, [trades, rate]);

  // Monthly Goal Check
  const currentMonthPnL = useMemo(() => {
    const now = new Date();
    let pnl = 0;
    trades.forEach(t => {
      const d = new Date(t.date);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        pnl += t.type === 'profit' ? t.amount : -t.amount;
      }
    });
    return pnl * rate;
  }, [trades, rate]);

  const formatMoney = (amount) => {
    const converted = amount * (currency === 'INR' ? rate : 1);
    if (currency === 'INR') {
      return `₹${converted.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    }
    return `$${converted.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const handleClearData = async () => {
    try {
      const idsToDelete = filteredTrades.map(t => t.id || t._id);
      if (idsToDelete.length > 0) {
        await supabase.from('trades').delete().in('id', idsToDelete);
      }
      setShowClearModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const goalProgress = Math.max(0, Math.min(100, (currentMonthPnL / monthlyGoal) * 100));

  return (
    <div className="font-mono text-brutal-black pb-12">
      
      {/* Daily Loss Limit Alert */}
      {todayPnL <= -dailyLossLimit && (
        <div className="mb-6 bg-[#FF4949] border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between text-white animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert size={36} />
            <div>
              <h2 className="text-2xl font-black uppercase tracking-widest">CRITICAL WARNING</h2>
              <p className="font-bold text-sm">Daily loss limit reached (-{currencySymbol}{Math.abs(todayPnL).toFixed(2)}). STOP TRADING FOR TODAY. Protect your capital.</p>
            </div>
          </div>
          <button className="border-2 border-white px-4 py-2 font-black uppercase text-sm hover:bg-white hover:text-[#FF4949] transition-colors cursor-pointer" onClick={() => alert('Log off your broker immediately.')}>ACKNOWLEDGE</button>
        </div>
      )}

      {/* TIMEFRAME FILTERS */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['week', 'month', 'all'].map(t => (
          <button 
            key={t}
            onClick={() => setTimeframe(t)}
            className={`px-4 py-2 border-4 border-black font-black uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none ${timeframe === t ? 'bg-black text-white' : 'bg-white hover:bg-gray-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700'}`}
          >
            {t === 'all' ? 'All-Time' : `This ${t}`}
          </button>
        ))}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="brutalist-card p-6 bg-white dark:bg-zinc-900 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-brutal-mint"></div>
          <h3 className="font-black uppercase text-sm mb-2 border-b-2 border-black pb-1 dark:text-white">Total Profit</h3>
          <p className="text-3xl md:text-4xl font-black text-brutal-mint" style={{textShadow: '2px 2px 0 #000'}}>{formatMoney(stats.totalProfit)}</p>
          <p className="text-xs font-bold mt-2 uppercase bg-brutal-mint text-black inline-block px-1 border border-black">{stats.profitTrades} WINS</p>
        </div>
        <div className="brutalist-card p-6 bg-white dark:bg-zinc-900 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-brutal-coral"></div>
          <h3 className="font-black uppercase text-sm mb-2 border-b-2 border-black pb-1 dark:text-white">Total Loss</h3>
          <p className="text-3xl md:text-4xl font-black text-brutal-coral" style={{textShadow: '2px 2px 0 #000'}}>{formatMoney(stats.totalLoss)}</p>
          <p className="text-xs font-bold mt-2 uppercase bg-brutal-coral text-white inline-block px-1 border border-black">{stats.lossTrades} LOSSES</p>
        </div>
        <div className="brutalist-card p-6 bg-white dark:bg-zinc-900 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-brutal-sky"></div>
          <h3 className="font-black uppercase text-sm mb-2 border-b-2 border-black pb-1 dark:text-white">Net P&L</h3>
          <p className={`text-3xl md:text-4xl font-black ${stats.netPnL >= 0 ? 'text-brutal-mint' : 'text-brutal-coral'}`} style={{textShadow: '2px 2px 0 #000'}}>
            {stats.netPnL > 0 ? '+' : ''}{formatMoney(stats.netPnL)}
          </p>
        </div>
        <div className="brutalist-card p-6 bg-white dark:bg-zinc-900 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-brutal-yellow"></div>
          <h3 className="font-black uppercase text-sm mb-2 border-b-2 border-black pb-1 dark:text-white">Win Rate</h3>
          <p className="text-3xl md:text-4xl font-black dark:text-white" style={{textShadow: '2px 2px 0 #FFE600'}}>{stats.winRate}%</p>
          <p className="text-xs font-bold mt-2 uppercase dark:text-gray-300">{stats.totalTrades} TOTAL TRADES</p>
        </div>
      </div>

      {/* Goal Tracker & Risk Limits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="border-4 border-black bg-white dark:bg-zinc-900 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
          <h3 className="font-black text-xl uppercase mb-4 text-black dark:text-white flex items-center gap-2"><Target/> Monthly Profit Goal</h3>
          <div className="flex justify-between items-end mb-2">
            <span className="font-bold text-sm text-gray-500 uppercase">Current: {currencySymbol}{currentMonthPnL.toFixed(2)}</span>
            <div className="flex flex-col items-end">
              <span className="font-black text-xs uppercase text-gray-400 mb-1">Target Goal</span>
              <input 
                type="number" 
                value={monthlyGoal} 
                onChange={(e) => setMonthlyGoal(e.target.value)} 
                className="w-24 border-b-2 border-black bg-transparent font-black text-lg focus:outline-none text-right dark:text-white"
              />
            </div>
          </div>
          <div className="w-full bg-gray-200 border-4 border-black h-8 relative">
            <div 
              className="bg-[#00FF66] h-full border-r-4 border-black transition-all duration-1000 ease-out flex items-center justify-end pr-2 overflow-hidden" 
              style={{ width: `${goalProgress}%` }}
            >
              {goalProgress > 10 && <span className="font-black text-black text-[10px] uppercase">{goalProgress.toFixed(1)}%</span>}
            </div>
          </div>
        </div>

        <div className="border-4 border-black bg-white dark:bg-zinc-900 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-black text-xl uppercase mb-4 text-black dark:text-white flex items-center gap-2"><ShieldAlert/> Risk Management Limits</h3>
          <p className="text-sm font-bold text-gray-500 mb-4">Set your strict daily loss limit to protect your capital from revenge trading and tilt.</p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs font-black uppercase block mb-1 text-black dark:text-white">Daily Loss Limit ({currencySymbol})</label>
              <input 
                type="number" 
                value={dailyLossLimit} 
                onChange={(e) => setDailyLossLimit(e.target.value)} 
                className="w-full border-4 border-black p-2 font-black text-lg bg-gray-100 text-[#FF4949] focus:outline-none"
              />
            </div>
            <div className="flex-1 bg-black text-[#FF4949] border-4 border-black p-2 text-center shadow-[4px_4px_0px_0px_rgba(255,73,73,1)]">
               <span className="text-[10px] font-bold uppercase block text-gray-300">Today's P&L</span>
               <span className="font-black text-xl">{todayPnL < 0 ? '-' : '+'}{currencySymbol}{Math.abs(todayPnL).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
           <PnLCalendar trades={filteredTrades} currency={currency} rate={rate} />
           
           {/* DANGER ZONE */}
           <div className="brutalist-card p-6 bg-brutal-gray/30 mt-6 border-brutal-coral dark:bg-zinc-800">
             <h3 className="text-lg font-black uppercase text-brutal-coral flex items-center gap-2 mb-4"><AlertTriangle/> Danger Zone</h3>
             <button 
               onClick={() => setShowClearModal(true)}
               className="brutalist-btn-coral w-full text-sm py-2"
             >
               CLEAR {timeframe.toUpperCase()} DATA
             </button>
           </div>
        </div>
        <div className="lg:col-span-2">
           <AnalyticsCharts trades={filteredTrades} />
        </div>
      </div>

      {/* CLEAR DATA MODAL */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brutal-coral/90 backdrop-blur-sm p-4">
          <div className="brutalist-card p-8 bg-white max-w-md w-full border-8 border-black">
             <h2 className="text-3xl font-black uppercase text-brutal-coral mb-4 flex items-center gap-2">
               <AlertTriangle size={32}/> DANGER
             </h2>
             <p className="font-bold text-lg mb-8 text-black">Are you sure you want to permanently clear data for this timeframe? This cannot be undone.</p>
             <div className="flex gap-4">
               <button onClick={() => setShowClearModal(false)} className="flex-1 brutalist-btn bg-white cursor-pointer">CANCEL</button>
               <button onClick={handleClearData} className="flex-1 brutalist-btn-coral text-white border-white cursor-pointer">CONFIRM</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
