import React, { useState } from 'react';
import { register } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusBanner from '../components/StatusBanner';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password1: '',
    password2: '',
    username: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.password1 !== formData.password2) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const { email, username, password1, password2 } = formData;
    const finalFormData = { email, username, password1, password2 };

    try {
      const response = await register(finalFormData);
      setSuccess("Account created successfully!");
      
      // Auto-login if backend returns a token (key)
      if (response.data.key) {
        setTimeout(() => {
            login(response.data.key, { email, username });
            navigate('/complete-profile');
        }, 1500);
      } else {
        setTimeout(() => {
            navigate('/signin'); 
        }, 2000);
      }
    } catch (err) {
      console.error('Error during registration:', err.response ? err.response.data : err.message);
      const backendError = err.response?.data?.email?.[0] || 
                           err.response?.data?.username?.[0] ||
                           err.response?.data?.password1?.[0] ||
                           'Registration failed. Please check your details.';
      setError(backendError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-linkler-bg)] px-4 py-12">
      <StatusBanner message={error} type="error" onClose={() => setError(null)} />
      <StatusBanner message={success} type="success" onClose={() => setSuccess(null)} />

      <div className="flex w-full max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        {/* Left Column - Branding */}
        <div className="hidden md:flex flex-col justify-center items-center w-5/12 bg-blue-600 text-white p-12">
          <h1 className="text-5xl font-black mb-6 uppercase tracking-tighter italic">Linkler</h1>
          <p className="text-center font-bold text-blue-100 leading-relaxed">
            Connect with travelers and guides from around the world. Share your journey and discover new places.
          </p>
        </div>

        {/* Right Column - Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12">
          <div className="md:hidden text-3xl font-black text-center text-[#3b82f6] mb-8 uppercase tracking-tighter italic">
            Linkler
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Create Account</h2>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Start your journey today</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Username</label>
                <input name="username" type="text" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="johndoe" value={formData.username} onChange={handleChange} />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                <input name="email" type="email" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="name@example.com" value={formData.email} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Password</label>
                    <input name="password1" type="password" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="••••••••" value={formData.password1} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Confirm</label>
                    <input name="password2" type="password" required className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="••••••••" value={formData.password2} onChange={handleChange} />
                </div>
              </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 mt-4"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="px-4 text-gray-400 bg-white">Social Connect</span>
            </div>
          </div>

          <div className="mt-6">
            <a
              href="http://127.0.0.1:8000/accounts/google/login/?process=login" 
              className="flex justify-center items-center gap-3 w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 transition-all active:scale-95"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z" />
                <path fill="#34A853" d="M16.04 18.013c-1.09.593-2.325.915-3.64.915-3.563 0-6.596-2.496-7.634-5.854L.714 16.195C2.713 20.216 6.96 23 12 23c3.03 0 5.83-.98 8.02-2.64l-3.98-2.347Z" />
                <path fill="#4285F4" d="M23.49 12.275c0-.796-.073-1.564-.208-2.308H12v4.36h6.44c-.278 1.464-1.08 2.705-2.32 3.54l3.98 2.347c2.327-2.145 3.67-5.298 3.67-8.94Z" />
                <path fill="#FBBC05" d="M5.266 14.235A7.074 7.074 0 0 1 4.764 12c0-.79.173-1.54.482-2.215L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.029-3.1Z" />
              </svg>
              <span className="text-sm font-bold text-gray-700">Google</span>
            </a>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs font-bold text-gray-400">
              Already have an account?{' '}
              <Link to="/signin" className="text-blue-600 hover:text-blue-700 ml-1 underline underline-offset-4">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
