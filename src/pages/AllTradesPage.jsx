import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import TradeGrid from '../components/TradeGrid';
import useCurrency from '../hooks/useCurrency';
import { AuthContext } from '../context/AuthContext';
import { Filter } from 'lucide-react';

const AllTradesPage = () => {
  const { user } = useContext(AuthContext);
  const [trades, setTrades] = useState([]);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'PROFIT' | 'LOSS'
  const { currency, rate } = useCurrency();
  const navigate = useNavigate();
  const { openEditModal } = useOutletContext();

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

  // Filter Trades Logic
  const filteredTrades = trades.filter((trade) => {
    const type = (trade.trade_type || trade.type || '').toUpperCase();

    if (filterType === 'PROFIT') {
      return type === 'PROFIT';
    }
    if (filterType === 'LOSS') {
      return type === 'LOSS';
    }
    return true; // 'ALL'
  });

  return (
    <div className="max-w-7xl mx-auto font-mono pb-12">
      {/* Header & Filter Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8 border-b-4 border-black pb-6">
        <div>
          <h1 className="text-3xl font-black uppercase text-black dark:text-white tracking-tight">
            📺 ALL TRADES LOG ({filteredTrades.length})
          </h1>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">
            Filter and review your historical trade executions
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap bg-gray-100 dark:bg-zinc-800 p-2 border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <span className="text-xs font-black uppercase text-black dark:text-white px-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5"/> FILTER:
          </span>

          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 font-black text-xs uppercase border-2 border-black transition-all cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-yellow-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-gray-200'
            }`}
          >
            ALL ({trades.length})
          </button>

          <button
            onClick={() => setFilterType('PROFIT')}
            className={`px-3 py-1.5 font-black text-xs uppercase border-2 border-black transition-all cursor-pointer ${
              filterType === 'PROFIT'
                ? 'bg-[#00FF66] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-gray-200'
            }`}
          >
            🟢 PROFIT ONLY
          </button>

          <button
            onClick={() => setFilterType('LOSS')}
            className={`px-3 py-1.5 font-black text-xs uppercase border-2 border-black transition-all cursor-pointer ${
              filterType === 'LOSS'
                ? 'bg-[#FF4949] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-gray-200'
            }`}
          >
            🔴 LOSS ONLY
          </button>
        </div>
      </div>

      {/* Trades Grid or Empty State */}
      {filteredTrades.length === 0 ? (
        <div className="border-4 border-black bg-white dark:bg-zinc-900 p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black uppercase text-black dark:text-white mb-2">
            NO {filterType} TRADES FOUND
          </h2>
          <p className="text-sm font-bold text-gray-500">
            {filterType === 'ALL'
              ? 'Start adding trades using the + NEW TRADE button.'
              : `There are currently no ${filterType.toLowerCase()} records matching your criteria.`}
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
