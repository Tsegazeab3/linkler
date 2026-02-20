import React, { useState } from 'react';
import { login as apiLogin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

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
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-linkler-bg)]">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-[#3b82f6] mb-6">
          Sign In to Linkler
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3b82f6] focus:border-[#3b82f6] sm:text-sm"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3b82f6] focus:border-[#3b82f6] sm:text-sm"
              disabled={loading}
            />
          </div>
          
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3b82f6] hover:bg-[#3b82f6]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b82f6] disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
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