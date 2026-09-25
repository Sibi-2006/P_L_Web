import React from 'react';
import { ArrowLeft, Calendar, DollarSign, FileText, Clock } from 'lucide-react';
import { calculateDuration } from './TradeGrid';

export default function TradeDetailsPage({ trade, onBack, currency = 'USD', rate = 1 }) {
  if (!trade) return null;

  const tradeTypeString = (trade.type || trade.tradeType || '').toUpperCase();
  const isProfit = tradeTypeString === 'PROFIT';
  const displayAmount = trade.amount * (currency === 'INR' ? rate : 1);
  const symbol = currency === 'INR' ? '₹' : '$';

  return (
    <div className="min-h-screen bg-yellow-400 p-8 font-mono text-black">
      {/* Navigation Header */}
      <button
        onClick={onBack}
        className="mb-8 border-4 border-black bg-white px-6 py-3 font-black text-lg uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2 cursor-pointer"
      >
        <ArrowLeft className="w-6 h-6"/> BACK TO DASHBOARD
      </button>

      {/* Main Trade Detail Card */}
      <div className="border-4 border-black bg-white p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Full Screenshot */}
        <div>
          <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
            🖼️ Trade Screenshot Chart
          </h2>
          <div className="border-4 border-black bg-black aspect-video overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
            {trade.imageUrl ? (
              <img
                src={trade.imageUrl}
                alt="Trade Execution Screenshot"
                className="w-full h-full object-contain"
              />
            ) : (
              <p className="text-white font-bold">NO CHART IMAGE ATTACHED</p>
            )}
          </div>
        </div>

        {/* Right Column: Breakdown & Notes */}
        <div className="flex flex-col justify-between">
          <div>
            {/* P&L Banner */}
            <div
              className={`border-4 border-black p-6 mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
                isProfit ? 'bg-[#00FF66] text-black' : 'bg-[#FF4949] text-white'
              }`}
            >
              <span className="text-sm font-black uppercase block">Trade Outcome</span>
              <h1 className="text-5xl font-black mt-1">
                {isProfit ? '+' : '-'}{symbol}{Math.abs(displayAmount).toFixed(2)}
              </h1>
            </div>

            {/* Metadata Box */}
            <div className="border-3 border-black bg-gray-100 p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1 flex items-center gap-3">
                <Calendar className="w-6 h-6"/>
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase block">Execution Date</span>
                  <span className="text-lg font-black">{new Date(trade.date).toLocaleDateString()}</span>
                </div>
              </div>
              {trade.pair && (
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-xs font-bold text-gray-500 uppercase block">Pair / Instrument</span>
                  <span className="text-lg font-black">{trade.pair}</span>
                </div>
              )}
              {trade.entryTime && (
                <div className="col-span-2 sm:col-span-1 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-500"/>
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase block">Entry Time</span>
                    <span className="text-lg font-black">{trade.entryTime}</span>
                  </div>
                </div>
              )}
              {trade.exitTime && (
                <div className="col-span-2 sm:col-span-1 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-500"/>
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase block">Exit Time</span>
                    <span className="text-lg font-black">{trade.exitTime}</span>
                  </div>
                </div>
              )}
              {trade.entryTime && trade.exitTime && (
                <div className="col-span-2">
                  <span className="text-xs font-bold text-gray-500 uppercase block">Trade Duration</span>
                  <span className="text-lg font-black">{calculateDuration(trade.entryTime, trade.exitTime)}</span>
                </div>
              )}
            </div>

            {/* Strategy Journal Notes */}
            <div className="border-3 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-xs font-black uppercase text-gray-500 flex items-center gap-1 mb-2">
                <FileText className="w-4 h-4"/> Trade Journal & Execution Notes
              </span>
              <p className="text-base font-bold whitespace-pre-wrap leading-relaxed">
                {trade.journal || 'No notes were written for this trade entry.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
