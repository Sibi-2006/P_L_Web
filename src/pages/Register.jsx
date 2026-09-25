import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      return setError('Passwords do not match.');
    }
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brutal-sky py-12">
      <div className="brutalist-card p-8 w-full max-w-md bg-white">
        <h1 className="text-4xl font-black mb-8 text-center uppercase tracking-tighter">
          Register
        </h1>
        {error && <div className="text-white font-bold mb-6 text-sm bg-brutal-coral p-3 border-4 border-black uppercase">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-black mb-2 text-lg uppercase">Full Name</label>
            <input 
              type="text" 
              className="brutalist-input" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="block font-black mb-2 text-lg uppercase">Email</label>
            <input 
              type="email" 
              className="brutalist-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="block font-black mb-2 text-lg uppercase">Password</label>
            <input 
              type="password" 
              className="brutalist-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="block font-black mb-2 text-lg uppercase">Confirm Password</label>
            <input 
              type="password" 
              className="brutalist-input" 
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="brutalist-btn w-full bg-brutal-mint text-xl py-4 mt-4">
            Create Profile
          </button>
        </form>
        <div className="mt-8 text-center font-bold text-sm uppercase">
          Already Registered? <Link to="/login" className="text-blue-700 hover:bg-brutal-mint px-2 py-1 transition-colors border-b-2 border-blue-700">Return to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
