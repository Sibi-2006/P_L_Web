import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Trash2, Edit } from 'lucide-react';
import { formatDateDDMMYYYY } from '../utils/formatters';

function NotesPage({ user }) {
  const [notes, setNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Psychology');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setNotes(data || []);
  };

  const handleSaveNote = async () => {
    if (!title || !content) return alert('Please enter both title and content');
    setUploading(true);
    
    let imageUrl = editingNote?.image_url || null;

    if (imageFile) {
      const fileName = `note-${Date.now()}-${imageFile.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('trade-screenshots') // Fallback to existing public bucket if needed
        .upload(fileName, imageFile);

      if (!uploadError) {
        const { data: publicData } = supabase.storage
          .from('trade-screenshots')
          .getPublicUrl(fileName);
        imageUrl = publicData.publicUrl;
      } else {
        alert('Failed to upload image. Make sure the bucket exists and is public.');
      }
    }

    if (editingNote) {
      // Update existing note
      await supabase
        .from('notes')
        .update({ title, category, content, image_url: imageUrl, updated_at: new Date().toISOString() })
        .eq('id', editingNote.id);
    } else {
      // Create new note
      await supabase
        .from('notes')
        .insert([{ user_id: user.id, title, category, content, image_url: imageUrl }]);
    }

    setUploading(false);
    setIsModalOpen(false);
    setEditingNote(null);
    setTitle('');
    setContent('');
    setImageFile(null);
    fetchNotes();
  };

  const handleDeleteNote = async (id, e) => {
    e.stopPropagation();
    if (confirm('Delete this note permanently?')) {
      await supabase.from('notes').delete().eq('id', id);
      fetchNotes();
    }
  };

  const openEditModal = (note, e) => {
    e.stopPropagation();
    setEditingNote(note);
    setTitle(note.title);
    setCategory(note.category);
    setContent(note.content);
    setImageFile(null); // Reset image file input when editing
    setIsModalOpen(true);
  };

  return (
    <div className="font-mono">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-black uppercase dark:text-white">📝 TRADING NOTES & PSYCHOLOGY</h2>
        <button
          onClick={() => {
            setEditingNote(null);
            setTitle('');
            setContent('');
            setImageFile(null);
            setIsModalOpen(true);
          }}
          className="border-3 border-black bg-cyan-300 text-black px-4 py-2 font-black text-sm uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
        >
          + ADD NOTE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => navigate(`/notes/${note.id}`)}
            className="border-4 border-black bg-white dark:bg-zinc-900 p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="border-2 border-black bg-yellow-300 text-black text-xs font-black px-2 py-0.5 uppercase">
                  {note.category}
                </span>
                <span className="text-[10px] font-bold text-gray-500">
                  {formatDateDDMMYYYY(note.created_at)}
                </span>
              </div>
              <h3 className="text-lg font-black text-black dark:text-white mb-2 line-clamp-1">{note.title}</h3>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                {note.content}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-black dark:border-white flex justify-between items-center">
              <span className="text-xs font-black uppercase text-blue-500 underline flex items-center gap-1">
                READ MORE → {note.image_url && '🖼️'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={(e) => openEditModal(note, e)}
                  className="bg-yellow-300 p-1 border-2 border-black"
                >
                  <Edit className="w-3.5 h-3.5 text-black"/>
                </button>
                <button
                  onClick={(e) => handleDeleteNote(note.id, e)}
                  className="bg-red-500 p-1 border-2 border-black text-white"
                >
                  <Trash2 className="w-3.5 h-3.5"/>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT NOTE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-black p-6 w-full max-w-lg shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-black uppercase mb-4">
              {editingNote ? 'EDIT NOTE' : 'CREATE NEW NOTE'}
            </h3>
            <input
              type="text"
              placeholder="Note Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-3 border-black p-2 font-bold mb-3"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border-3 border-black p-2 font-bold mb-3 bg-white"
            >
              <option value="Psychology">Psychology</option>
              <option value="Rules & Strategy">Rules & Strategy</option>
              <option value="Daily Journal">Daily Journal</option>
              <option value="Market Analysis">Market Analysis</option>
            </select>
            <textarea
              placeholder="Write your execution or mindset notes here..."
              value={content}
              rows={5}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border-3 border-black p-2 font-bold mb-3"
            />
            
            {/* Optional Image Input */}
            <div className="mb-4">
              <label className="text-xs font-black uppercase text-gray-700 block mb-1">
                📷 OPTIONAL IMAGE / CHART SCREENSHOT
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full border-2 border-black p-1 text-xs font-bold bg-gray-100"
              />
              {editingNote?.image_url && !imageFile && (
                <p className="text-[10px] font-bold text-blue-600 mt-1">
                  Note already has an image attached. Uploading a new one will replace it.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 border-2 border-black px-4 py-2 font-black uppercase text-xs"
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveNote}
                disabled={uploading}
                className="bg-[#00FF66] border-2 border-black px-4 py-2 font-black uppercase text-xs disabled:opacity-50"
              >
                {uploading ? 'SAVING...' : 'SAVE NOTE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotesPage;
