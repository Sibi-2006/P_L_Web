import React from 'react';
import api from '../api/axios';

const TradeList = ({ trades, currencyRate, useInr, onTradeDeleted }) => {
  const formatMoney = (amount) => {
    if (useInr && currencyRate) {
      return `₹${(amount * currencyRate).toFixed(2)}`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trade?')) return;
    try {
      await api.delete(`/trades/${id}`);
      onTradeDeleted();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="hud-panel p-6">
      <h2 className="text-xl font-mono text-brand-blue mb-4">TRADE HISTORY</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-sm">
          <thead>
            <tr className="text-hud-muted border-b border-hud-border">
              <th className="pb-2">DATE</th>
              <th className="pb-2">TYPE</th>
              <th className="pb-2">AMOUNT</th>
              <th className="pb-2">JOURNAL</th>
              <th className="pb-2 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {trades.map(trade => (
              <tr key={trade._id} className="border-b border-hud-border/50 hover:bg-hud-bg/50">
                <td className="py-3">{new Date(trade.date).toLocaleDateString()}</td>
                <td className={`py-3 ${trade.type === 'profit' ? 'text-brand-green' : 'text-brand-red'}`}>
                  {trade.type.toUpperCase()}
                </td>
                <td className="py-3">{formatMoney(trade.amount)}</td>
                <td className="py-3 text-hud-muted truncate max-w-xs">{trade.journal || '-'}</td>
                <td className="py-3 text-right">
                  <button onClick={() => handleDelete(trade._id)} className="text-brand-red hover:text-white">
                    DEL
                  </button>
                </td>
              </tr>
            ))}
            {trades.length === 0 && (
              <tr>
                <td colSpan="5" className="py-6 text-center text-hud-muted">No trades logged yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeList;
