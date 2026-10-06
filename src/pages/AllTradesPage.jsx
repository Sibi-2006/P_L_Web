import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import TradeGrid from '../components/TradeGrid';
import useCurrency from '../hooks/useCurrency';
import { AuthContext } from '../context/AuthContext';

const AllTradesPage = () => {
  const { user } = useContext(AuthContext);
  const [trades, setTrades] = useState([]);
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

  return (
    <div className="max-w-7xl mx-auto font-mono pb-12">
      <h2 className="text-3xl font-black uppercase text-black dark:text-white mb-6">📺 ALL TRADES</h2>
      <TradeGrid 
        trades={trades}
        onDeleteTrade={handleDeleteTrade}
        onEditTrade={openEditModal}
        onSelectTrade={handleSelectTrade}
        currency={currency}
        rate={rate}
      />
    </div>
  );
};

export default AllTradesPage;
