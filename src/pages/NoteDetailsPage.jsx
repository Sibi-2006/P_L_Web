import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, ZoomIn, ZoomOut, RotateCcw, X, Maximize2 } from 'lucide-react';
import { formatDateDDMMYYYY } from '../utils/formatters';

// --- REUSABLE LIGHTBOX MODAL ---
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
      {/* Top Control Bar */}
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

      {/* Main Image Container */}
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
          alt="Note Attachment Full View"
          style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, transition: isDragging ? 'none' : 'transform 0.2s ease-out' }}
          className="max-h-[85vh] max-w-[90vw] object-contain shadow-2xl pointer-events-none"
        />
      </div>
    </div>
  );
}

// --- NOTE DETAILS PAGE ---
function NoteDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (!error) setNote(data);
  };

  if (!note) return <div className="font-mono text-black dark:text-white p-6">LOADING NOTE...</div>;

  return (
    <div className="font-mono max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate('/notes')}
        className="mb-6 border-3 border-black bg-white dark:bg-zinc-800 text-black dark:text-white px-4 py-2 font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4"/> BACK TO NOTES
      </button>

      <div className="border-4 border-black bg-white dark:bg-zinc-900 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center mb-4 border-b-3 border-black pb-4">
          <span className="border-2 border-black bg-yellow-300 text-black text-xs font-black px-3 py-1 uppercase">
            {note.category}
          </span>
          <span className="text-xs font-bold text-gray-500">
            {formatDateDDMMYYYY(note.created_at)}
          </span>
        </div>

        <h1 className="text-3xl font-black text-black dark:text-white mb-6">{note.title}</h1>

        {/* CLICKABLE NOTE ATTACHMENT IMAGE */}
        {note.image_url && (
          <div className="mb-6">
            <h3 className="text-xs font-black uppercase text-gray-500 mb-2">📷 ATTACHED SCREENSHOT / CHART</h3>
            <div
              onClick={() => setIsZoomOpen(true)}
              className="border-4 border-black bg-black aspect-video overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative group cursor-pointer"
            >
              <img
                src={note.image_url}
                alt={note.title}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-sm uppercase gap-2 pointer-events-none">
                <Maximize2 className="w-5 h-5"/> CLICK FOR FULL SCREEN
              </div>
            </div>
          </div>
        )}

        {/* Note Text Content */}
        <div className="bg-gray-100 dark:bg-zinc-800 p-6 border-3 border-black text-black dark:text-white font-bold whitespace-pre-wrap leading-relaxed">
          {note.content}
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {isZoomOpen && (
        <ImageZoomModal imageUrl={note.image_url} onClose={() => setIsZoomOpen(false)} />
      )}
    </div>
  );
}

export default NoteDetailsPage;
