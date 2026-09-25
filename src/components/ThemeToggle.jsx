import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 border-3 border-black dark:border-white bg-yellow-300 dark:bg-purple-900 text-black dark:text-white px-3 py-1.5 font-mono font-black uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer"
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-yellow-300"/> LIGHT MODE
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-black"/> DARK MODE
        </>
      )}
    </button>
  );
}
