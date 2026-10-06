import React, { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import TradeFormModal from './TradeFormModal';
import useCurrency from '../hooks/useCurrency';
import { useTheme } from '../context/ThemeContext';
import { AuthContext } from '../context/AuthContext';

export default function MainLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const { currency, toggleCurrency } = useCurrency();
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useContext(AuthContext);

  const handleTradeAdded = () => {
    window.dispatchEvent(new Event('tradeAdded'));
  };

  const openEditModal = (trade) => {
    setEditingTrade(trade);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTrade(null);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 dark:bg-[#0F0F11]">
      <div className="max-w-7xl mx-auto">
        <Navbar 
          onOpenNewTradeModal={() => {
            setEditingTrade(null);
            setIsModalOpen(true);
          }}
          currency={currency}
          onToggleCurrency={toggleCurrency}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onLogout={logout}
        />
        <Outlet context={{ currency, openEditModal }} />
      </div>
      <TradeFormModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onTradeAdded={handleTradeAdded}
        editingTrade={editingTrade}
      />
    </div>
  );
}
