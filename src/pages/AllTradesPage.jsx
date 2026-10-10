import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import TradeGrid from '../components/TradeGrid';
import useCurrency from '../hooks/useCurrency';
import { AuthContext } from '../context/AuthContext';
import { Filter, Search, Download } from 'lucide-react';

const AllTradesPage = () => {
  const { user } = useContext(AuthContext);
  const [trades, setTrades] = useState([]);
  
  // Advanced Filter States
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPair, setSelectedPair] = useState('ALL');

  const { currency, rate } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();
  const { openEditModal } = useOutletContext();

  const queryDate = new URLSearchParams(location.search).get('date');

  useEffect(() => {
    if (queryDate) {
      setStartDate(queryDate);
      setEndDate(queryDate);
    }
  }, [queryDate]);

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

  const handleDeleteTrade = async (id) => {
    if (!window.confirm('DANGER: Permanently delete this trade?')) return;
    try {
      await supabase.from('trades').delete().eq('id', id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectTrade = (trade) => {
    navigate(`/trade/${trade.id}`);
  };

  const uniquePairs = [...new Set(trades.map(t => t.pair).filter(Boolean))];

  // Filter Trades Logic
  const filteredTrades = trades.filter((trade) => {
    const type = (trade.trade_type || trade.type || '').toUpperCase();
    
    if (filterType === 'PROFIT' && type !== 'PROFIT') return false;
    if (filterType === 'LOSS' && type !== 'LOSS') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchPair = (trade.pair || '').toLowerCase().includes(q);
      const matchJournal = (trade.journal || '').toLowerCase().includes(q);
      if (!matchPair && !matchJournal) return false;
    }

    if (startDate && new Date(trade.date) < new Date(startDate)) return false;
    if (endDate && new Date(trade.date) > new Date(endDate)) return false;

    if (selectedPair !== 'ALL' && trade.pair !== selectedPair) return false;

    return true;
  });

  const exportToCSV = () => {
    if (filteredTrades.length === 0) return alert('No trades to export.');
    
    const headers = ['Date', 'Pair', 'Direction', 'Type', 'Amount', 'Entry Price', 'Exit Price', 'Stop Loss', 'Take Profit', 'Lot Size', 'Mood Before', 'Mood After', 'Journal'];
    const csvRows = [headers.join(',')];
    
    filteredTrades.forEach(t => {
      const pnl = (t.trade_type || t.type || '').toUpperCase() === 'LOSS' ? -Math.abs(t.amount) : Math.abs(t.amount);
      const row = [
        new Date(t.date).toLocaleDateString(),
        t.pair || '',
        t.trade_direction || '',
        t.trade_type || t.type || '',
        pnl,
        t.entry_price || '',
        t.exit_price || '',
        t.stop_loss || '',
        t.take_profit || '',
        t.lot_size || '',
        t.mood_before || '',
        t.mood_after || '',
        `"${(t.journal || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto font-mono pb-12">
      {/* Header & Export Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 border-b-4 border-black pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase text-black dark:text-white tracking-tight">
            📺 ALL TRADES LOG ({filteredTrades.length})
          </h1>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">
            Filter, search, and export your historical trade executions
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="bg-black text-white px-4 py-2 border-4 border-black font-black uppercase shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 transition-transform flex items-center gap-2 cursor-pointer text-sm"
        >
          <Download className="w-4 h-4"/> EXPORT CSV
        </button>
      </div>

      {/* Advanced Filters Toolbar */}
      <div className="bg-white dark:bg-zinc-900 border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 items-end">
          
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Search Journal/Pair</label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
              <input 
                type="text"
                placeholder="Search keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-2 border-black p-1.5 pl-8 text-sm font-bold bg-gray-50 text-black focus:outline-none focus:bg-yellow-100"
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Start Date</label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border-2 border-black p-1.5 text-sm font-bold bg-gray-50 text-black focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">End Date</label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border-2 border-black p-1.5 text-sm font-bold bg-gray-50 text-black focus:outline-none"
            />
          </div>

          {/* Pair Dropdown */}
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Asset Pair</label>
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="border-2 border-black p-1.5 text-sm font-bold bg-gray-50 text-black focus:outline-none min-w-[120px]"
            >
              <option value="ALL">ALL PAIRS</option>
              {uniquePairs.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Win/Loss Status Filters */}
        <div className="flex items-center gap-2 border-t-2 border-dashed border-gray-300 pt-4 mt-2">
          <span className="text-xs font-black uppercase text-black dark:text-white px-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5"/> STATUS:
          </span>
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1 font-black text-xs uppercase border-2 border-black transition-all cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-gray-100'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setFilterType('PROFIT')}
            className={`px-3 py-1 font-black text-xs uppercase border-2 border-black transition-all cursor-pointer ${
              filterType === 'PROFIT'
                ? 'bg-[#00FF66] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-gray-100'
            }`}
          >
            PROFIT ONLY
          </button>
          <button
            onClick={() => setFilterType('LOSS')}
            className={`px-3 py-1 font-black text-xs uppercase border-2 border-black transition-all cursor-pointer ${
              filterType === 'LOSS'
                ? 'bg-[#FF4949] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-gray-100'
            }`}
          >
            LOSS ONLY
          </button>
        </div>
      </div>

      {/* Trades Grid or Empty State */}
      {filteredTrades.length === 0 ? (
        <div className="border-4 border-black bg-white dark:bg-zinc-900 p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-8">
          <h2 className="text-2xl font-black uppercase text-black dark:text-white mb-2">
            NO TRADES FOUND
          </h2>
          <p className="text-sm font-bold text-gray-500">
            Adjust your filters or add new trades matching these criteria.
          </p>
        </div>
      ) : (
        <TradeGrid 
          trades={filteredTrades}
          onDeleteTrade={handleDeleteTrade}
          onEditTrade={openEditModal}
          onSelectTrade={handleSelectTrade}
          currency={currency}
          rate={rate}
        />
      )}
    </div>
  );
};

export default AllTradesPage;
