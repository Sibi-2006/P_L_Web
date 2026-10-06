import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft } from 'lucide-react';
import { formatDateDDMMYYYY } from '../utils/formatters';

function NoteDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);

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

  if (!note) return <div className="font-mono text-black dark:text-white">LOADING NOTE...</div>;

  return (
    <div className="font-mono max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/notes')}
        className="mb-6 border-3 border-black bg-white dark:bg-zinc-800 text-black dark:text-white px-4 py-2 font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
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

        <div className="bg-gray-100 dark:bg-zinc-800 p-6 border-3 border-black text-black dark:text-white font-bold whitespace-pre-wrap leading-relaxed">
          {note.content}
        </div>
      </div>
    </div>
  );
}

export default NoteDetailsPage;
