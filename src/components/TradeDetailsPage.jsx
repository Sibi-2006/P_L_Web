import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Calendar, DollarSign, FileText, Clock, ZoomIn, ZoomOut, RotateCcw, X, Maximize2 } from 'lucide-react';
import { calculateDuration } from './TradeGrid';

// ─────────────────────────────────────────────────────────────────────────────
// FULL-SCREEN IMAGE ZOOM MODAL
// Supports: button zoom, mouse-wheel zoom, click-and-drag pan, Esc to close
// ─────────────────────────────────────────────────────────────────────────────
function ImageZoomModal({ imageUrl, onClose }) {
  const [scale, setScale]   = useState(1);
  const [pos, setPos]       = useState({ x: 0, y: 0 });
  const dragging            = useRef(false);
  const lastPos             = useRef({ x: 0, y: 0 });

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Mouse-wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setScale(s => Math.min(Math.max(s - e.deltaY * 0.001, 0.5), 5));
  }, []);

  const handleReset = () => { setScale(1); setPos({ x: 0, y: 0 }); };

  // Drag-to-pan handlers
  const onMouseDown = (e) => {
    dragging.current = true;
    lastPos.current  = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };
  const onMouseMove = (e) => {
    if (!dragging.current) return;
    setPos({ x: e.clientX - lastPos.current.x, y: e.clientY - lastPos.current.y });
  };
  const onMouseUp = () => { dragging.current = false; };

  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* ── Top toolbar ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-white/20 shrink-0">
        <div className="flex items-center gap-2">
          {/* Zoom In */}
          <button
            id="zoom-in-btn"
            onClick={() => setScale(s => Math.min(s + 0.25, 5))}
            title="Zoom In"
            className="flex items-center gap-1 px-3 py-2 border-2 border-white bg-white/10 text-white font-black uppercase text-sm hover:bg-white hover:text-black transition-all"
          >
            <ZoomIn className="w-4 h-4" /> +
          </button>

          {/* Zoom Out */}
          <button
            id="zoom-out-btn"
            onClick={() => setScale(s => Math.max(s - 0.25, 0.5))}
            title="Zoom Out"
            className="flex items-center gap-1 px-3 py-2 border-2 border-white bg-white/10 text-white font-black uppercase text-sm hover:bg-white hover:text-black transition-all"
          >
            <ZoomOut className="w-4 h-4" /> −
          </button>

          {/* Reset */}
          <button
            id="zoom-reset-btn"
            onClick={handleReset}
            title="Reset Zoom & Pan"
            className="flex items-center gap-1 px-3 py-2 border-2 border-white bg-white/10 text-white font-black uppercase text-sm hover:bg-[#FFE600] hover:text-black hover:border-[#FFE600] transition-all"
          >
            <RotateCcw className="w-4 h-4" /> ↺ Reset
          </button>

          {/* Scale readout */}
          <span className="ml-2 text-white/60 font-mono text-xs">
            {(scale * 100).toFixed(0)}%
          </span>
        </div>

        {/* Close */}
        <button
          id="zoom-close-btn"
          onClick={onClose}
          title="Close (Esc)"
          className="flex items-center gap-1 px-3 py-2 border-2 border-[#FF4949] bg-[#FF4949] text-white font-black uppercase text-sm hover:bg-white hover:text-[#FF4949] transition-all"
        >
          <X className="w-5 h-5" /> Close
        </button>
      </div>

      {/* ── Image canvas — drag + wheel zoom ── */}
      <div
        className="flex-1 overflow-hidden flex items-center justify-center select-none"
        onWheel={handleWheel}
        style={{ cursor: scale > 1 ? 'grab' : 'default' }}
      >
        <img
          src={imageUrl}
          alt="Trade chart — full screen"
          draggable={false}
          onMouseDown={onMouseDown}
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transition: dragging.current ? 'none' : 'transform 0.15s ease',
            maxWidth: '90vw',
            maxHeight: '85vh',
            objectFit: 'contain',
            cursor: dragging.current ? 'grabbing' : scale > 1 ? 'grab' : 'default',
          }}
        />
      </div>

      {/* ── Hint bar ── */}
      <div className="text-center text-white/40 text-[10px] font-mono py-2 shrink-0">
        🖱 Scroll to zoom · Click &amp; drag to pan · Esc to close
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRADE DETAILS PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function TradeDetailsPage({ trade, onBack, currency = 'USD', rate = 1 }) {
  const [zoomOpen, setZoomOpen] = useState(false);

  if (!trade) return null;

  const tradeTypeString = (trade.type || trade.tradeType || '').toUpperCase();
  const isProfit        = tradeTypeString === 'PROFIT';
  const displayAmount   = trade.amount * (currency === 'INR' ? rate : 1);
  const symbol          = currency === 'INR' ? '₹' : '$';

  return (
    <div className="min-h-screen bg-yellow-400 p-8 font-mono text-black">
      {/* Full-screen zoom modal */}
      {zoomOpen && (
        <ImageZoomModal
          imageUrl={trade.imageUrl}
          onClose={() => setZoomOpen(false)}
        />
      )}

      {/* Navigation Header */}
      <button
        onClick={onBack}
        className="mb-8 border-4 border-black bg-white px-6 py-3 font-black text-lg uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2 cursor-pointer"
      >
        <ArrowLeft className="w-6 h-6" /> BACK TO DASHBOARD
      </button>

      {/* Main Trade Detail Card */}
      <div className="border-4 border-black bg-white p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Left Column: Screenshot ── */}
        <div>
          <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
            🖼️ Trade Screenshot Chart
          </h2>

          {/* Image wrapper — clickable to open zoom */}
          <div className="relative group border-4 border-black bg-black aspect-video overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
            {trade.imageUrl ? (
              <>
                <img
                  src={trade.imageUrl}
                  alt="Trade Execution Screenshot"
                  className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                />
                {/* Zoom overlay hint */}
                <button
                  id="open-zoom-modal-btn"
                  onClick={() => setZoomOpen(true)}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/0 group-hover:bg-black/50 transition-all duration-200 cursor-zoom-in"
                  title="Click to inspect full-screen"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center gap-2 text-white font-black uppercase text-sm">
                    <Maximize2 className="w-8 h-8" />
                    Click to Zoom
                  </span>
                </button>
              </>
            ) : (
              <p className="text-white font-bold">NO CHART IMAGE ATTACHED</p>
            )}
          </div>

          {/* Zoom hint badge */}
          {trade.imageUrl && (
            <p className="mt-2 text-xs font-bold uppercase text-gray-600 flex items-center gap-1">
              <Maximize2 className="w-3 h-3" />
              Click image to open full-screen zoom inspector
            </p>
          )}
        </div>

        {/* ── Right Column: Breakdown & Notes ── */}
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
                <Calendar className="w-6 h-6" />
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
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase block">Entry Time</span>
                    <span className="text-lg font-black">{trade.entryTime}</span>
                  </div>
                </div>
              )}
              {trade.exitTime && (
                <div className="col-span-2 sm:col-span-1 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-500" />
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
                <FileText className="w-4 h-4" /> Trade Journal &amp; Execution Notes
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
