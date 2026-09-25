import React from 'react';
import { Calendar, Trash2, Image as ImageIcon } from 'lucide-react';

export function calculateDuration(entry, exit) {
  if (!entry || !exit) return 'N/A';
  
  const [entryH, entryM] = entry.split(':').map(Number);
  const [exitH, exitM] = exit.split(':').map(Number);
  
  let totalMinutes = (exitH * 60 + exitM) - (entryH * 60 + entryM);
  if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle trades crossing midnight

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours === 0) return `${mins} mins`;
  return `${hours}h ${mins}m`;
}

export default function TradeGrid({ trades, onDeleteTrade, onSelectTrade, currency = 'USD', rate = 1 }) {
  if (!trades || trades.length === 0) {
    return (
      <div className="border-4 border-black bg-white dark:bg-zinc-900 dark:text-white p-8 text-center font-mono font-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]">
        NO TRADES LOGGED YET.
      </div>
    );
  }

  const formatAmount = (val) => {
    const converted = val * (currency === 'INR' ? rate : 1);
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol}${Math.abs(converted).toFixed(2)}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {trades.map((trade) => {
        const tradeTypeString = (trade.type || trade.tradeType || '').toUpperCase();
        const isProfit = tradeTypeString === 'PROFIT';

        return (
          <div
            key={trade._id || trade.id}
            className="border-4 border-black bg-white dark:bg-zinc-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col justify-between overflow-hidden group cursor-pointer"
          >
            {/* Thumbnail Header Area - Click to view full trade */}
            <div
              onClick={() => onSelectTrade && onSelectTrade(trade)}
              className="relative aspect-video bg-gray-200 dark:bg-zinc-800 border-b-4 border-black overflow-hidden"
            >
              {trade.imageUrl ? (
                <img
                  src={trade.imageUrl}
                  alt="Trade Chart Screenshot"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-yellow-200 dark:bg-yellow-600 p-4">
                  <ImageIcon className="w-10 h-10 text-black mb-1 opacity-70"/>
                  <span className="text-xs font-mono font-black uppercase text-black">No Chart Attached</span>
                </div>
              )}

              {/* P&L Badge Overlay */}
              <div className="absolute top-2 left-2">
                <span
                  className={`border-2 border-black font-black px-2 py-0.5 uppercase text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                    isProfit ? 'bg-[#00FF66] text-black' : 'bg-[#FF4949] text-white'
                  }`}
                >
                  {isProfit ? 'PROFIT' : 'LOSS'}
                </span>
              </div>

              {/* Pair Badge Overlay */}
              {trade.pair && (
                <div className="absolute top-2 right-2">
                  <span className="border-2 border-black font-black px-2 py-0.5 uppercase text-xs bg-yellow-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {trade.pair}
                  </span>
                </div>
              )}

              {/* Amount Badge Overlay (YouTube Duration Style) */}
              <div className="absolute bottom-2 right-2 bg-black text-white px-2 py-0.5 border border-black font-mono font-black text-sm shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                <span className={isProfit ? 'text-[#00FF66]' : 'text-[#FF4949]'}>
                  {isProfit ? '+' : '-'}{formatAmount(trade.amount)}
                </span>
              </div>
              
              {/* Duration Badge Overlay on Thumbnail */}
              {trade.entryTime && trade.exitTime && (
                <div className="absolute bottom-2 left-2 bg-black text-white px-2 py-0.5 border border-black font-mono font-black text-xs shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] flex items-center gap-1">
                  <span>⏱️ {calculateDuration(trade.entryTime, trade.exitTime)}</span>
                </div>
              )}
            </div>

            {/* Card Metadata Footer */}
            <div className="p-4 flex flex-col flex-grow justify-between font-mono dark:text-white">
              <div onClick={() => onSelectTrade && onSelectTrade(trade)}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-black uppercase text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3"/>
                    {new Date(trade.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm font-bold line-clamp-2 mt-1">
                  {trade.journal || 'No journal notes written.'}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="mt-4 pt-3 border-t-2 border-black dark:border-white flex justify-between items-center">
                <button
                  onClick={() => onSelectTrade && onSelectTrade(trade)}
                  className="text-xs font-black uppercase underline hover:text-blue-500 cursor-pointer"
                >
                  VIEW FULL DETAILS →
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDeleteTrade) onDeleteTrade(trade._id || trade.id);
                  }}
                  className="bg-[#FF4949] text-white p-1.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 transition-all cursor-pointer"
                  title="Delete Trade"
                >
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
