import React, { useState } from 'react';
import { login as apiLogin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import StatusBanner from '../components/StatusBanner';

function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/app";

  const handleSubmit = (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    console.log('Login attempt with:', { email, password });

    apiLogin(email, password)
      .then(response => {
        console.log('Login successful:', response.data);
        login(response.data.key, response.data.user || { email });
        // On success, redirect to the intended page or app
        navigate(from, { replace: true });
      })
      .catch(err => {
        console.error('Login error:', err.response ? err.response.data : err);
        const backendError = err.response?.data?.non_field_errors?.[0] || 
                             err.response?.data?.detail || 
                             'Login failed. Please check your credentials and try again.';
        setError(backendError);
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-linkler-bg)] px-4">
      <StatusBanner message={error} onClose={() => setError(null)} />
      
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border border-gray-100">
        <h1 className="text-3xl font-black text-center text-[#3b82f6] mb-8 uppercase tracking-tighter">
          Linkler
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all"
              disabled={loading}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-500 bg-white">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
          <a
            href="http://127.0.0.1:8000/accounts/google/login/?process=login"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b82f6]"
          >
            Sign in with Google
          </a>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-[#3b82f6] hover:text-blue-500">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;