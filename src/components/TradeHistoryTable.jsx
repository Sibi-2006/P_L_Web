import React, { useState } from 'react';
import api from '../api/axios';
import { Image as ImageIcon, Trash2, ArrowUpDown } from 'lucide-react';

const TradeHistoryTable = ({ trades, currencyRate, useInr, onTradeDeleted }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const tradesPerPage = 10;
  
  // Just for UI mockup purposes
  const [selectedImage, setSelectedImage] = useState(null);

  const formatMoney = (amount) => {
    if (useInr && currencyRate) {
      return `₹${(amount * currencyRate).toFixed(2)}`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const handleDelete = async (id) => {
    if (!window.confirm('DANGER: Permanently delete this trade?')) return;
    try {
      await api.delete(`/trades/${id}`);
      onTradeDeleted();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedTrades = [...trades].sort((a, b) => {
    if (sortConfig.key === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
    if (sortConfig.key === 'amount') {
      return sortConfig.direction === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
    return 0;
  });

  const indexOfLastTrade = currentPage * tradesPerPage;
  const indexOfFirstTrade = indexOfLastTrade - tradesPerPage;
  const currentTrades = sortedTrades.slice(indexOfFirstTrade, indexOfLastTrade);
  const totalPages = Math.ceil(sortedTrades.length / tradesPerPage);

  return (
    <div className="brutalist-card p-0 md:p-6 bg-white overflow-hidden">
      <div className="p-4 md:p-0 mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase">Trade History</h2>
        <span className="font-bold bg-brutal-yellow border-2 border-black px-3 py-1">
          {trades.length} TRADES
        </span>
      </div>
      
      <div className="overflow-x-auto border-y-4 md:border-4 border-black">
        <table className="w-full text-left font-mono">
          <thead>
            <tr className="bg-brutal-gray border-b-4 border-black uppercase text-sm">
              <th className="p-4 border-r-4 border-black cursor-pointer hover:bg-brutal-yellow transition-colors" onClick={() => handleSort('date')}>
                <div className="flex items-center justify-between">Date <ArrowUpDown size={14}/></div>
              </th>
              <th className="p-4 border-r-4 border-black">Type</th>
              <th className="p-4 border-r-4 border-black cursor-pointer hover:bg-brutal-yellow transition-colors" onClick={() => handleSort('amount')}>
                <div className="flex items-center justify-between">Amount <ArrowUpDown size={14}/></div>
              </th>
              <th className="p-4 border-r-4 border-black">Journal</th>
              <th className="p-4 border-r-4 border-black text-center">Media</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentTrades.map((trade, idx) => (
              <tr key={trade._id} className={`border-b-4 border-black hover:bg-brutal-yellow/10 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <td className="p-4 border-r-4 border-black whitespace-nowrap font-bold">
                  {new Date(trade.date).toLocaleDateString()}
                </td>
                <td className="p-4 border-r-4 border-black">
                  <span className={`inline-block px-2 py-1 border-2 border-black font-black uppercase text-xs ${trade.type === 'profit' ? 'bg-brutal-mint' : 'bg-brutal-coral text-white'}`}>
                    {trade.type}
                  </span>
                </td>
                <td className="p-4 border-r-4 border-black font-black text-lg">
                  {formatMoney(trade.amount)}
                </td>
                <td className="p-4 border-r-4 border-black text-sm max-w-[200px] truncate">
                  {trade.journal || '---'}
                </td>
                <td className="p-4 border-r-4 border-black text-center">
                  <button 
                    onClick={() => setSelectedImage('mock')}
                    className="p-2 border-2 border-black bg-white hover:bg-brutal-sky hover:translate-x-0.5 hover:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all inline-block"
                  >
                    <ImageIcon size={16} />
                  </button>
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => handleDelete(trade._id)} 
                    className="p-2 border-2 border-black bg-white text-brutal-coral hover:bg-brutal-coral hover:text-white hover:translate-x-0.5 hover:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all inline-block"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {currentTrades.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center font-bold uppercase text-gray-500 bg-brutal-gray">
                  No trades found for this timeframe.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 p-4 md:p-0">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border-4 border-black font-bold uppercase hover:bg-brutal-yellow disabled:opacity-50 disabled:hover:bg-white"
          >
            Previous
          </button>
          <span className="font-bold uppercase">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border-4 border-black font-bold uppercase hover:bg-brutal-yellow disabled:opacity-50 disabled:hover:bg-white"
          >
            Next
          </button>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedImage(null)}>
          <div className="brutalist-card bg-white p-4 max-w-4xl max-h-[90vh] overflow-auto">
             <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1000&auto=format&fit=crop" alt="Mock Chart" className="w-full border-4 border-black shadow-brutal" />
             <p className="mt-4 text-center font-black uppercase">Example Chart Screenshot</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeHistoryTable;
