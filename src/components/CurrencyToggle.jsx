import React from 'react';

export default function CurrencyToggle({ currency, onToggle, rate, isLoading }) {
  return (
    <button
      onClick={onToggle}
      disabled={isLoading}
      className="border-3 border-black bg-emerald-400 dark:bg-emerald-600 text-black dark:text-white px-3 py-1.5 font-mono font-black uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-pointer flex items-center gap-1.5"
    >
      <span>{currency === 'USD' ? '💵 USD ($)' : '🇮🇳 INR (₹)'}</span>
      {isLoading && <span className="animate-spin">⏳</span>}
    </button>
  );
}
