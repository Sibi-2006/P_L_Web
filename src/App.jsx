import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AllTradesPage from './pages/AllTradesPage';
import TradeDetailsPage from './components/TradeDetailsPage';
import NotesPage from './pages/NotesPage';
import NoteDetailsPage from './pages/NoteDetailsPage';
import MainLayout from './components/MainLayout';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div className="min-h-screen bg-[#FFE600] flex items-center justify-center font-mono font-black text-2xl text-black">LOADING SESSION...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/viewalltrades" element={<AllTradesPage />} />
              <Route path="/trade/:id" element={<TradeDetailsPage />} />
              <Route path="/notes" element={(
                <AuthContext.Consumer>
                  {({ user }) => <NotesPage user={user} />}
                </AuthContext.Consumer>
              )} />
              <Route path="/notes/:id" element={<NoteDetailsPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
