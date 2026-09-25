import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import TradeFormModal from '../components/TradeFormModal';
import TradeGrid from '../components/TradeGrid';
import PnLCalendar from '../components/PnLCalendar';
import TradeDetailsPage from '../components/TradeDetailsPage';
import AnalyticsCharts from '../components/AnalyticsCharts';
import ThemeToggle from '../components/ThemeToggle';
import CurrencyToggle from '../components/CurrencyToggle';
import useCurrency from '../hooks/useCurrency';
import { LogOut, Plus, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [trades, setTrades] = useState([]);
  const { currency, rate, isLoading, toggleCurrency } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeframe, setTimeframe] = useState('all'); // 'week', 'month', 'all'
  const [showClearModal, setShowClearModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const tradesRes = await api.get('/trades');
      setTrades(tradesRes.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const formatMoney = (amount) => {
    const converted = amount * (currency === 'INR' ? rate : 1);
    if (currency === 'INR') {
      return `₹${converted.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    }
    return `$${converted.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const handleClearData = async () => {
    try {
      for (const t of filteredTrades) {
        await api.delete(`/trades/${t._id}`);
      }
      setShowClearModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTrade = async (id) => {
    if (!window.confirm('DANGER: Permanently delete this trade?')) return;
    try {
      await api.delete(`/trades/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleScrollToTrades = () => {
    document.getElementById('trade-grid-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (selectedTrade) {
    return <TradeDetailsPage trade={selectedTrade} onBack={() => setSelectedTrade(null)} currency={currency} rate={rate} />;
  }

  return (
    <div className="max-w-7xl mx-auto font-mono text-brutal-black pb-12">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 brutalist-card p-4 md:p-6 bg-white dark:bg-[#18181B] dark:border-white dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] gap-4 transition-all">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter dark:text-white">Command Center</h1>
          <p className="font-bold mt-1 text-lg uppercase bg-brutal-yellow text-black inline-block px-2 border-2 border-black">AGENT: {user?.name}</p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={handleScrollToTrades}
            className="border-3 border-black bg-purple-400 dark:bg-purple-600 text-black dark:text-white px-3 py-1.5 font-mono font-black uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer flex items-center gap-1.5"
          >
            📺 ALL TRADES
          </button>
          <CurrencyToggle currency={currency} rate={rate} isLoading={isLoading} onToggle={toggleCurrency} />
          <ThemeToggle />
          <button 
            onClick={() => setIsModalOpen(true)}
            className="brutalist-btn-yellow flex items-center gap-2"
          >
            <Plus size={20} strokeWidth={4} /> NEW TRADE
          </button>
          <button onClick={logout} className="p-3 border-4 border-black dark:border-white bg-white dark:bg-black dark:text-white hover:bg-brutal-coral hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
            <LogOut size={24} />
          </button>
        </div>
      </header>

      {/* TIMEFRAME FILTERS */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['week', 'month', 'all'].map(t => (
          <button 
            key={t}
            onClick={() => setTimeframe(t)}
            className={`px-4 py-2 border-4 border-black font-black uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none ${timeframe === t ? 'bg-black text-white' : 'bg-white hover:bg-gray-200'}`}
          >
            {t === 'all' ? 'All-Time' : `This ${t}`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="brutalist-card p-6 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-brutal-mint"></div>
          <h3 className="font-black uppercase text-sm mb-2 border-b-2 border-black pb-1">Total Profit</h3>
          <p className="text-3xl md:text-4xl font-black text-brutal-mint" style={{textShadow: '2px 2px 0 #000'}}>{formatMoney(stats.totalProfit)}</p>
          <p className="text-xs font-bold mt-2 uppercase bg-brutal-mint text-black inline-block px-1 border border-black">{stats.profitTrades} WINS</p>
        </div>
        <div className="brutalist-card p-6 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-brutal-coral"></div>
          <h3 className="font-black uppercase text-sm mb-2 border-b-2 border-black pb-1">Total Loss</h3>
          <p className="text-3xl md:text-4xl font-black text-brutal-coral" style={{textShadow: '2px 2px 0 #000'}}>{formatMoney(stats.totalLoss)}</p>
          <p className="text-xs font-bold mt-2 uppercase bg-brutal-coral text-white inline-block px-1 border border-black">{stats.lossTrades} LOSSES</p>
        </div>
        <div className="brutalist-card p-6 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-brutal-sky"></div>
          <h3 className="font-black uppercase text-sm mb-2 border-b-2 border-black pb-1">Net P&L</h3>
          <p className={`text-3xl md:text-4xl font-black ${stats.netPnL >= 0 ? 'text-brutal-mint' : 'text-brutal-coral'}`} style={{textShadow: '2px 2px 0 #000'}}>
            {stats.netPnL > 0 ? '+' : ''}{formatMoney(stats.netPnL)}
          </p>
        </div>
        <div className="brutalist-card p-6 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-brutal-yellow"></div>
          <h3 className="font-black uppercase text-sm mb-2 border-b-2 border-black pb-1">Win Rate</h3>
          <p className="text-3xl md:text-4xl font-black" style={{textShadow: '2px 2px 0 #FFE600'}}>{stats.winRate}%</p>
          <p className="text-xs font-bold mt-2 uppercase">{stats.totalTrades} TOTAL TRADES</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
           <PnLCalendar trades={filteredTrades} currency={currency} rate={rate} />
           
           {/* DANGER ZONE */}
           <div className="brutalist-card p-6 bg-brutal-gray/30 mt-6 border-brutal-coral">
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

      <div id="trade-grid-section">
        <TradeGrid 
          trades={filteredTrades}
          onDeleteTrade={handleDeleteTrade}
          onSelectTrade={setSelectedTrade}
          currency={currency}
          rate={rate}
        />
      </div>

      <TradeFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTradeAdded={fetchData} 
      />

      {/* CLEAR DATA MODAL */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brutal-coral/90 backdrop-blur-sm p-4">
          <div className="brutalist-card p-8 bg-white max-w-md w-full border-8 border-black">
             <h2 className="text-3xl font-black uppercase text-brutal-coral mb-4 flex items-center gap-2">
               <AlertTriangle size={32}/> DANGER
             </h2>
             <p className="font-bold text-lg mb-8">Are you sure you want to permanently clear data for this timeframe? This cannot be undone.</p>
             <div className="flex gap-4">
               <button onClick={() => setShowClearModal(false)} className="flex-1 brutalist-btn bg-white">CANCEL</button>
               <button onClick={handleClearData} className="flex-1 brutalist-btn-coral text-white border-white">CONFIRM</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
