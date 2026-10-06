import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Sun, Moon, LogOut, BookOpen, LayoutDashboard, Tv } from 'lucide-react';

export default function Navbar({ onOpenNewTradeModal, currency, onToggleCurrency, isDark, onToggleTheme, onLogout }) {
  return (
    <header className="sticky top-0 z-40 border-b-4 border-black bg-white dark:bg-zinc-900 p-4 mb-6 shadow-[0_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[0_4px_0px_0px_rgba(255,255,255,1)] flex flex-wrap justify-between items-center gap-4 font-mono">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-black text-black dark:text-white uppercase tracking-tight">
          COMMAND CENTER
        </h1>
        <nav className="flex items-center gap-2 flex-wrap">
          <Link className="border-2 border-black bg-yellow-300 px-3 py-1.5 font-black text-xs uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1" to="/">
            <LayoutDashboard className="w-4 h-4"/> HOME
          </Link>
          <Link className="border-2 border-black bg-purple-400 px-3 py-1.5 font-black text-xs uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1" to="/viewalltrades">
            <Tv className="w-4 h-4"/> ALL TRADES
          </Link>
          <Link className="border-2 border-black bg-cyan-300 px-3 py-1.5 font-black text-xs uppercase text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-1" to="/notes">
            <BookOpen className="w-4 h-4"/> NOTES
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onToggleCurrency}
          className="border-2 border-black bg-emerald-400 text-black px-3 py-1.5 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
        >
          {currency === 'USD' ? '💵 USD ($)' : '🇮🇳 INR (₹)'}
        </button>
        <button
          onClick={onToggleTheme}
          className="border-2 border-black bg-orange-300 text-black px-3 py-1.5 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4 inline"/> : <Moon className="w-4 h-4 inline"/>}
        </button>
        <button
          onClick={onOpenNewTradeModal}
          className="border-2 border-black bg-yellow-400 text-black px-3 py-1.5 font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-4 h-4"/> NEW TRADE
        </button>
        <button
          onClick={onLogout}
          className="border-2 border-black bg-red-500 text-white p-1.5 font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          title="Logout"
        >
          <LogOut className="w-4 h-4"/>
        </button>
      </div>
    </header>
  );
}
