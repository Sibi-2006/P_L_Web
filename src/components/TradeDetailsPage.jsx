import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Edit, Trash2, ZoomIn, ZoomOut, RotateCcw, X, Maximize2 } from 'lucide-react';
import useCurrency from '../hooks/useCurrency';
import { formatDateDDMMYYYY } from '../utils/formatters';

// --- FULL-SCREEN ZOOM MODAL ---
function ImageZoomModal({ imageUrl, onClose }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle pan drag
  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 font-mono select-none"
      onClick={onClose}
    >
      {/* Control Bar */}
      <div className="flex justify-between items-center z-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-2 bg-white border-3 border-black p-1.5 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          <button
            onClick={() => setScale((s) => Math.min(s + 0.5, 4))}
            className="p-2 border-2 border-black bg-gray-100 hover:bg-yellow-300 font-bold text-black"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5"/>
          </button>
          <button
            onClick={() => {
              const newScale = Math.max(scale - 0.5, 1);
              setScale(newScale);
              if (newScale === 1) setPosition({ x: 0, y: 0 });
            }}
            className="p-2 border-2 border-black bg-gray-100 hover:bg-yellow-300 font-bold text-black"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5"/>
          </button>
          <button
            onClick={() => {
              setScale(1);
              setPosition({ x: 0, y: 0 });
            }}
            className="p-2 border-2 border-black bg-gray-100 hover:bg-yellow-300 font-bold text-black"
            title="Reset Zoom"
          >
            <RotateCcw className="w-5 h-5"/>
          </button>
          <span className="p-2 border-2 border-black bg-black text-white font-black text-xs flex items-center min-w-[60px] justify-center">
            {Math.round(scale * 100)}%
          </span>
        </div>

        <button
          onClick={onClose}
          className="bg-[#FF4949] text-white p-2.5 border-3 border-black font-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-red-600 transition-all cursor-pointer"
          title="Close (Esc)"
        >
          <X className="w-6 h-6"/>
        </button>
      </div>

      {/* Image Display */}
      <div
        className={`flex-1 flex items-center justify-center overflow-hidden p-4 ${scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={imageUrl}
          alt="Trade Chart Full View"
          style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, transition: isDragging ? 'none' : 'transform 0.2s ease-out' }}
          className="max-h-[85vh] max-w-[90vw] object-contain shadow-2xl pointer-events-none"
        />
      </div>
    </div>
  );
}

export default function TradeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openEditModal } = useOutletContext();
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const { currency, rate } = useCurrency();

  useEffect(() => {
    fetchTradeDetails();
    const handleTradeAdded = () => fetchTradeDetails();
    window.addEventListener('tradeAdded', handleTradeAdded);
    return () => window.removeEventListener('tradeAdded', handleTradeAdded);
  }, [id]);

  const fetchTradeDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('id', id)
      .single();

    if (!error) setTrade(data);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this trade?')) {
      await supabase.from('trades').delete().eq('id', id);
      navigate('/viewalltrades');
    }
  };

  if (loading) return <div className="p-6 font-mono font-bold dark:text-white">LOADING TRADE DETAILS...</div>;
  if (!trade) return <div className="p-6 font-mono font-bold text-red-500">TRADE NOT FOUND.</div>;

  const tradeType = (trade.trade_type || trade.type || '').toUpperCase();
  const isProfit = tradeType === 'PROFIT';
  const numAmount = Math.abs(Number(trade.amount) || 0);
  const convertedAmount = currency === 'INR' ? numAmount * rate : numAmount;
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const formattedPrice = `${currencySymbol}${convertedAmount.toFixed(2)}`;
  
  const chartUrl = trade.image_url || trade.imageUrl;

  return (
    <div className="p-6 font-mono max-w-6xl mx-auto">
      {/* Top Bar Navigation & Actions */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/viewalltrades')}
          className="border-4 border-black bg-white dark:bg-zinc-800 text-black dark:text-white px-5 py-2.5 font-black text-sm uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5"/> BACK TO ALL TRADES
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => openEditModal && openEditModal(trade)}
            className="border-4 border-black bg-yellow-300 text-black px-4 py-2.5 font-black text-sm uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 cursor-pointer"
          >
            <Edit className="w-4 h-4"/> EDIT TRADE
          </button>
          <button
            onClick={handleDelete}
            className="border-4 border-black bg-[#FF4949] text-white px-4 py-2.5 font-black text-sm uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4"/> DELETE
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="border-4 border-black bg-white dark:bg-[#18181B] p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Trade Screenshot */}
        <div>
          <h2 className="text-xl font-black uppercase mb-4 text-black dark:text-white flex items-center gap-2">
            🖼️ TRADE SCREENSHOT CHART
          </h2>
          <div
            onClick={() => chartUrl && setIsZoomOpen(true)}
            className={`border-4 border-black bg-black aspect-video overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center relative group ${
              chartUrl ? 'cursor-pointer' : ''
            }`}
          >
            {chartUrl ? (
              <>
                <img
                  src={chartUrl}
                  alt="Trade Chart Screenshot"
                  className="w-full h-full object-contain block opacity-100 group-hover:scale-105 transition-transform duration-200"
                />
                {/* Click to expand overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-sm uppercase gap-2 pointer-events-none">
                  <Maximize2 className="w-5 h-5"/> CLICK TO VIEW FULL SCREEN 🔍
                </div>
              </>
            ) : (
              <p className="text-white font-bold text-sm">NO CHART IMAGE ATTACHED</p>
            )}
          </div>
        </div>

        {/* Right Column: Dynamic Outcome & Metadata */}
        <div className="flex flex-col justify-between">
          <div>
            <div
              className={`border-4 border-black p-6 mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
                isProfit ? 'bg-[#00FF66] text-black' : 'bg-[#FF4949] text-white'
              }`}
            >
              <span className="text-xs font-black uppercase tracking-wider block">TRADE OUTCOME</span>
              <h1 className="text-5xl font-black mt-1">
                {isProfit ? '+' : '-'}{formattedPrice}
              </h1>
            </div>

            <div className="border-3 border-black bg-gray-100 dark:bg-zinc-800 p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] grid grid-cols-2 gap-4 text-black dark:text-white">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase block">EXECUTION DATE</span>
                <span className="text-base font-black">{formatDateDDMMYYYY(trade.date)}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase block">PAIR / INSTRUMENT</span>
                <span className="text-base font-black">{trade.pair || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase block">ENTRY TIME</span>
                <span className="text-base font-black">{trade.entry_time || trade.entryTime || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase block">EXIT TIME</span>
                <span className="text-base font-black">{trade.exit_time || trade.exitTime || 'N/A'}</span>
              </div>
            </div>

            <div className="border-3 border-black bg-white dark:bg-zinc-900 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black dark:text-white">
              <span className="text-xs font-black uppercase text-gray-500 block mb-2">
                📝 TRADE JOURNAL & EXECUTION NOTES
              </span>
              <p className="text-sm font-bold whitespace-pre-wrap leading-relaxed">
                {trade.journal || 'No journal notes written.'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lightbox Modal */}
      {isZoomOpen && (
        <ImageZoomModal imageUrl={chartUrl} onClose={() => setIsZoomOpen(false)} />
      )}
    </div>
  );
}
