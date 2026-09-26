import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

const API_HEALTH_URL = 'https://p-l-backend.onrender.com/api/health';

// ─────────────────────────────────────────────────────────────────────────────
// 1. NEO-BRUTALIST MONEY WAKE-UP LOADING SCREEN
// Shown while pinging the Render server (free-tier cold start can take ~30 s)
// ─────────────────────────────────────────────────────────────────────────────
function ServerWakeupScreen({ message = 'WAKING UP SERVER...' }) {
  // Animated ticker characters cycling through money symbols
  const symbols = ['💸', '💰', '📈', '🤑', '💵'];
  const [symIdx, setSymIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSymIdx(i => (i + 1) % symbols.length), 600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFE600] flex flex-col items-center justify-center p-6 font-mono">
      <div className="border-4 border-black bg-white p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-center max-w-md w-full">

        {/* Cycling money emoji */}
        <div className="text-6xl mb-6" style={{ transition: 'transform 0.3s', display: 'inline-block' }}>
          {symbols[symIdx]}
        </div>

        {/* Animated progress bar */}
        <div className="w-full bg-gray-200 border-2 border-black h-6 mb-4 overflow-hidden relative">
          <div
            className="bg-[#00FF66] h-full border-r-2 border-black"
            style={{
              width: '100%',
              animation: 'wakeupBar 2s ease-in-out infinite alternate',
            }}
          />
        </div>

        <style>{`
          @keyframes wakeupBar {
            from { width: 20%; }
            to   { width: 90%; }
          }
        `}</style>

        <h2 className="text-xl font-black text-black uppercase mb-2 tracking-tight">
          {message}
        </h2>

        <p className="text-xs font-bold text-gray-600 uppercase border-t-2 border-black pt-3 mt-3">
          ⚡ Establishing secure connection...
          <br />
          <span className="text-[10px] text-gray-500 font-normal normal-case">
            This may take a few seconds on first load.
          </span>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. PROTECTED ROUTE  — shows the money loading screen while AuthContext checks
//    the 7-day session; redirects to /login if no valid session exists.
// ─────────────────────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <ServerWakeupScreen message="FETCHING YOUR SESSION..." />;
  if (!user) return <Navigate to="/login" />;
  return children;
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. MAIN APP — pings /api/health before rendering anything, ensuring the
//    Render backend is awake before the user tries to log in.
// ─────────────────────────────────────────────────────────────────────────────
const App = () => {
  // true once the server responds (or times out after 45 s)
  const [isServerReady, setIsServerReady] = useState(false);

  useEffect(() => {
    let done = false;

    const wakeServer = async () => {
      // Poll until server responds (max 45 s, then give up gracefully)
      const deadline = Date.now() + 45_000;

      while (Date.now() < deadline) {
        try {
          const res = await fetch(API_HEALTH_URL, { signal: AbortSignal.timeout(10_000) });
          if (res.ok && !done) {
            done = true;
            setIsServerReady(true);
            return;
          }
        } catch {
          // Server still waking — wait 3 s and retry
          await new Promise(r => setTimeout(r, 3000));
        }
      }

      // 45-second deadline reached — unblock the UI anyway
      if (!done) {
        done = true;
        setIsServerReady(true);
      }
    };

    wakeServer();
  }, []);

  // ── Render wake-up screen until Render server confirms it's alive ──
  if (!isServerReady) {
    return <ServerWakeupScreen message="CONNECTING TO LIVE SERVER..." />;
  }

  // ── Normal app shell ──
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen p-4 md:p-8 dark:bg-[#0F0F11]">
            <Routes>
              <Route path="/login"    element={<Login />} />
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
