import React, { useState } from 'react';
import api from '../api/axios';

const TradeForm = ({ onTradeAdded }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('profit');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [journal, setJournal] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/trades', {
        amount: Number(amount),
        type,
        date,
        journal
      });
      setAmount('');
      setJournal('');
      onTradeAdded();
    } catch (err) {
      console.error('Failed to add trade', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hud-panel p-6 mb-6">
      <h2 className="text-xl font-mono text-brand-green mb-4">LOG NEW TRADE</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-hud-muted text-xs font-mono uppercase mb-1">Amount (USD)</label>
          <input type="number" className="hud-input" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div>
          <label className="block text-hud-muted text-xs font-mono uppercase mb-1">Type</label>
          <select className="hud-input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="profit">PROFIT</option>
            <option value="loss">LOSS</option>
          </select>
        </div>
        <div>
          <label className="block text-hud-muted text-xs font-mono uppercase mb-1">Date</label>
          <input type="date" className="hud-input" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <label className="block text-hud-muted text-xs font-mono uppercase mb-1">Journal Note</label>
          <input type="text" className="hud-input" value={journal} onChange={(e) => setJournal(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={loading} className="hud-button-green w-full">
            {loading ? 'PROCESSING...' : 'SUBMIT TRADE'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TradeForm;
