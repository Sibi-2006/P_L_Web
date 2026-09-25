import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/Dashboard';

// --- NEO-BRUTALIST MONEY LOADING SCREEN ---
function MoneyLoadingScreen({ message = "WAKING UP SERVER & FETCHING TRADES..." }) {
  return (
    <div className="min-h-screen bg-[#FFE600] flex flex-col items-center justify-center p-6 font-mono">
      <div className="border-4 border-black bg-white p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-center max-w-md w-full">
        {/* Bouncing Money Emoji */}
        <div className="text-6xl mb-4 animate-bounce">
          💰
        </div>
        
        {/* Animated Progress Pulse */}
        <div className="w-full bg-gray-200 border-2 border-black h-6 mb-4 overflow-hidden relative">
          <div className="bg-[#00FF66] h-full border-r-2 border-black animate-pulse w-3/4"></div>
        </div>

        <h2 className="text-xl font-black text-black uppercase mb-2 tracking-tight">
          {message}
        </h2>

        <p className="text-xs font-bold text-gray-600 uppercase border-t-2 border-black pt-3 mt-3">
          ⚡ Live Server: <span className="underline">p-l-backend.onrender.com</span>
          <br />
          <span className="text-[10px] text-gray-500 font-normal">
            (Cold starts on free tier may take ~30s on first load)
          </span>
        </p>
      </div>
    </div>
  );
}

const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <MoneyLoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen p-4 md:p-8 dark:bg-[#0F0F11]">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;


