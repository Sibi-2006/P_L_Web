import React, { useState } from 'react';
import api from '../api/axios';
import { X, UploadCloud } from 'lucide-react';

const TradeFormModal = ({ isOpen, onClose, onTradeAdded }) => {
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
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('type', type);
      formData.append('date', date);
      formData.append('journal', journal);
      if (pair) formData.append('pair', pair);
      if (entryTime) formData.append('entryTime', entryTime);
      if (exitTime) formData.append('exitTime', exitTime);
      if (fileObject) {
        formData.append('image', fileObject);
      }
      
      console.log("Submitting form data entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0]+ ', ' + pair[1]); 
      }

      await api.post('/trades', formData);
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
      console.error('Failed to add trade', err);
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
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
        
        <h2 className="text-3xl font-black mb-6 uppercase border-b-4 border-black pb-4">Log New Trade</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={() => setType('profit')}
              className={`flex-1 py-3 border-4 border-black font-black uppercase text-lg transition-all ${type === 'profit' ? 'bg-brutal-mint shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-1 translate-y-1' : 'bg-white shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal-sm'}`}
            >
              PROFIT
            </button>
            <button 
              type="button"
              onClick={() => setType('loss')}
              className={`flex-1 py-3 border-4 border-black font-black uppercase text-lg transition-all ${type === 'loss' ? 'bg-brutal-coral shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-1 translate-y-1' : 'bg-white shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal-sm'}`}
            >
              LOSS
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-black uppercase mb-1">Pair / Instrument</label>
              <input
                type="text"
                placeholder="e.g. XAUUSD"
                value={pair}
                onChange={(e) => setPair(e.target.value.toUpperCase())}
                className="w-full border-3 border-black p-2 font-mono font-bold uppercase focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-1">Amount ($ / ₹)</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full border-3 border-black p-2 font-mono font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-black uppercase mb-1">Entry Time ⏰</label>
              <input
                type="time"
                value={entryTime}
                onChange={(e) => setEntryTime(e.target.value)}
                className="w-full border-3 border-black p-2 font-mono font-bold focus:outline-none bg-white text-black"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-1">Exit Time ⏱️</label>
              <input
                type="time"
                value={exitTime}
                onChange={(e) => setExitTime(e.target.value)}
                className="w-full border-3 border-black p-2 font-mono font-bold focus:outline-none bg-white text-black"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block font-black mb-2 text-lg uppercase">Date</label>
            <input type="date" className="brutalist-input text-xl" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div>
            <label className="block font-black mb-2 text-lg uppercase">Journal Notes</label>
            <textarea 
              className="brutalist-input min-h-[120px] resize-y" 
              value={journal} 
              onChange={(e) => setJournal(e.target.value)} 
              placeholder="What was the strategy? What went well? What went wrong?"
            />
          </div>

          <div>
            <label className="block font-black mb-2 text-lg uppercase">Trade Chart (Optional)</label>
            <div className="border-4 border-black border-dashed p-8 bg-brutal-gray/20 text-center relative hover:bg-brutal-yellow/20 transition-colors cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {image ? (
                <div className="flex flex-col items-center">
                  <img src={image} alt="Preview" className="max-h-48 border-4 border-black shadow-brutal object-cover mb-4" />
                  <span className="font-bold bg-white border-2 border-black px-2 py-1 uppercase text-sm">Change Image</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-600">
                  <UploadCloud size={48} className="mb-4 text-black" />
                  <p className="font-black uppercase">Drag & Drop or Click to Upload</p>
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading} className="brutalist-btn-yellow w-full text-2xl py-4 mt-8">
            {loading ? 'PROCESSING...' : 'SUBMIT TRADE'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TradeFormModal;
