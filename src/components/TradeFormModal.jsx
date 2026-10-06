import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from '../context/AuthContext';
import { X, UploadCloud } from 'lucide-react';

const TradeFormModal = ({ isOpen, onClose, onTradeAdded, editingTrade }) => {
  const { user } = useContext(AuthContext);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('profit');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [journal, setJournal] = useState('');
  const [pair, setPair] = useState('');
  const [entryTime, setEntryTime] = useState('');
  const [exitTime, setExitTime] = useState('');
  const [image, setImage] = useState(null);
  const [fileObject, setFileObject] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingTrade) {
      setAmount(Math.abs(Number(editingTrade.amount)).toString());
      setType(editingTrade.trade_type?.toLowerCase() || editingTrade.type?.toLowerCase() || 'profit');
      setDate(editingTrade.date || new Date().toISOString().split('T')[0]);
      setJournal(editingTrade.journal || '');
      setPair(editingTrade.pair || '');
      setEntryTime(editingTrade.entry_time || editingTrade.entryTime || '');
      setExitTime(editingTrade.exit_time || editingTrade.exitTime || '');
      setImage(editingTrade.image_url || editingTrade.imageUrl || null);
      setFileObject(null);
    } else {
      setAmount('');
      setType('profit');
      setDate(new Date().toISOString().split('T')[0]);
      setJournal('');
      setPair('');
      setEntryTime('');
      setExitTime('');
      setImage(null);
      setFileObject(null);
    }
  }, [editingTrade, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileObject(e.target.files[0]);
      setImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = editingTrade ? (editingTrade.image_url || editingTrade.imageUrl) : null;

      if (fileObject) {
        const fileName = `${Date.now()}-${fileObject.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from('trade-screenshots')
          .upload(fileName, fileObject);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('trade-screenshots')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      const tradeData = {
        user_id: user.id,
        trade_type: type.toUpperCase(),
        pair: pair || null,
        amount: parseFloat(amount) * (type === 'loss' ? -1 : 1), // Optional depending on how amount is stored
        entry_time: entryTime || null,
        exit_time: exitTime || null,
        date: date,
        journal: journal || null,
        image_url: imageUrl
      };

      // Since previous code didn't do amount sign conversion here, I'll stick to original logic:
      tradeData.amount = parseFloat(amount);

      if (editingTrade) {
        const { error } = await supabase.from('trades').update(tradeData).eq('id', editingTrade.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('trades').insert([tradeData]);
        if (error) throw error;
      }

      setAmount('');
      setJournal('');
      setPair('');
      setEntryTime('');
      setExitTime('');
      setImage(null);
      setFileObject(null);
      onTradeAdded();
      onClose();
    } catch (err) {
      console.error('Failed to save trade', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="brutalist-card p-6 w-full max-w-2xl bg-white relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-brutal-yellow border-4 border-black hover:translate-x-1 hover:translate-y-1 shadow-brutal-sm hover:shadow-none active:translate-x-2 active:translate-y-2 transition-all cursor-pointer z-10"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-3xl font-black mb-6 uppercase border-b-4 border-black pb-4 text-black">
          {editingTrade ? 'EDIT TRADE' : 'LOG NEW TRADE'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={() => setType('profit')}
              className={`flex-1 py-3 border-4 border-black font-black uppercase text-lg transition-all text-black ${type === 'profit' ? 'bg-[#00FF66] shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-1 translate-y-1' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]'}`}
            >
              PROFIT
            </button>
            <button 
              type="button"
              onClick={() => setType('loss')}
              className={`flex-1 py-3 border-4 border-black font-black uppercase text-lg transition-all text-black ${type === 'loss' ? 'bg-[#FF3366] shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-1 translate-y-1' : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]'}`}
            >
              LOSS
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-black uppercase mb-1 text-black">Pair / Instrument</label>
              <input
                type="text"
                placeholder="e.g. XAUUSD"
                value={pair}
                onChange={(e) => setPair(e.target.value.toUpperCase())}
                className="w-full border-4 border-black p-2 font-mono font-bold uppercase focus:outline-none text-black bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-1 text-black">Amount ($ / ₹)</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full border-4 border-black p-2 font-mono font-bold focus:outline-none text-black bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-black uppercase mb-1 text-black">Entry Time ⏰</label>
              <input
                type="time"
                value={entryTime}
                onChange={(e) => setEntryTime(e.target.value)}
                className="w-full border-4 border-black p-2 font-mono font-bold focus:outline-none bg-white text-black"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-1 text-black">Exit Time ⏱️</label>
              <input
                type="time"
                value={exitTime}
                onChange={(e) => setExitTime(e.target.value)}
                className="w-full border-4 border-black p-2 font-mono font-bold focus:outline-none bg-white text-black"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-black mb-2 text-lg uppercase text-black">Date</label>
            <input type="date" className="w-full border-4 border-black p-2 font-mono font-bold focus:outline-none text-black bg-white text-xl" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div>
            <label className="block font-black mb-2 text-lg uppercase text-black">Journal Notes</label>
            <textarea 
              className="w-full border-4 border-black p-2 font-mono font-bold focus:outline-none text-black bg-white min-h-[120px] resize-y" 
              value={journal} 
              onChange={(e) => setJournal(e.target.value)} 
              placeholder="What was the strategy? What went well? What went wrong?"
            />
          </div>

          <div>
            <label className="block font-black mb-2 text-lg uppercase text-black">Trade Chart (Optional)</label>
            <div className="border-4 border-black border-dashed p-8 bg-gray-100 text-center relative hover:bg-[#FFE600] transition-colors cursor-pointer text-black">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {image ? (
                <div className="flex flex-col items-center">
                  <img src={image} alt="Preview" className="max-h-48 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] object-cover mb-4" />
                  <span className="font-bold bg-white border-2 border-black px-2 py-1 uppercase text-sm">Change Image</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-800">
                  <UploadCloud size={48} className="mb-4 text-black" />
                  <p className="font-black uppercase">Drag & Drop or Click to Upload</p>
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#FFE600] text-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-2 active:translate-y-2 active:shadow-none font-black text-2xl py-4 mt-8 transition-all uppercase">
            {loading ? 'PROCESSING...' : (editingTrade ? 'UPDATE TRADE' : 'SUBMIT TRADE')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TradeFormModal;
