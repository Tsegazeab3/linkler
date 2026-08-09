import React, { useState } from 'react';
import { login as apiLogin, getProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
    User, 
    Mail, 
    Lock, 
    ChevronRight,
    Compass,
    Eye,
    EyeOff
} from "lucide-react";

function SignInPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/app";

  const handleSubmit = (event) => {
    event.preventDefault();
    setError(null);

    if (!identifier.trim() || !password.trim()) {
      const msg = "Please enter your credentials.";
      setError(msg);
      toast.error("Missing Info", { description: msg });
      return;
    }

    setLoading(true);

    apiLogin(identifier, password)
      .then(async response => {
        const token = response.data.key;
        try {
            localStorage.setItem('token', token); 
            const profileRes = await getProfile();
            login(token, profileRes.data);
            toast.success("Welcome back!");
            navigate(from, { replace: true });
        } catch (profileErr) {
            console.error("Failed to fetch full profile after login", profileErr);
            login(token, response.data.user || { username: identifier });
            navigate(from, { replace: true });
        }
      })
      .catch(err => {
        const backendError = err.response?.data?.non_field_errors?.[0] || 
                             err.response?.data?.detail || 
                             'Sign in failed. Please check your credentials.';
        setError(backendError);
        toast.error("Access Denied", { description: backendError });
        setLoading(false);
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-linkler-bg)] p-4 sm:p-8">
      <div className="flex w-full max-w-5xl mx-auto bg-ui-white rounded-[3rem] shadow-2xl overflow-hidden min-h-[700px] border border-ui-border">
        {/* Left Column */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 bg-gradient-to-br from-brand to-accent-indigo text-white relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 space-y-6">
            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Reconnect. Explore. Discover.</h1>
            <p className="text-white/80 text-lg leading-relaxed font-medium">
              Your next adventure is waiting. Sign in to access your trips, messages, and saved destinations.
            </p>
          </div>

          <div className="relative z-10 w-full flex-grow flex items-center justify-center py-12">
             <div className="w-80 h-80 bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 flex items-center justify-center shadow-[0_50px_100px_rgba(0,0,0,0.2)] p-12 rotate-3 transition-all hover:rotate-0 hover:scale-105 duration-700 group">
                <Compass className="w-full h-full text-white/90 animate-in zoom-in-75 duration-700 group-hover:rotate-45 transition-transform" strokeWidth={1} />
             </div>
          </div>
          
          <div className="relative z-10 text-sm font-bold uppercase tracking-widest text-white/60">
            © 2026 Linkler Exploration Network
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-20 flex flex-col justify-center bg-ui-white">
          <div className="w-full max-w-sm mx-auto space-y-10">
            <div className="text-center lg:text-left space-y-2">
              <h2 className="text-4xl font-black text-ui-text-main italic tracking-tighter uppercase">Sign In</h2>
              <p className="text-sm font-medium text-ui-muted">Welcome back! Please enter your details.</p>
            </div>

            {error && (
                <div className="p-4 bg-error-light/10 border border-error/20 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                    <span className="text-error shrink-0">⚠️</span>
                    <p className="text-xs font-bold text-error uppercase tracking-widest">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2 group">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-muted ml-1">Username or Email</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ui-muted group-focus-within:text-brand transition-colors" />
                    <Input 
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                        placeholder="yourname@email.com" 
                        className="h-14 pl-12 rounded-2xl bg-ui-bg-alt border-ui-border font-bold text-ui-text-main" 
                    />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <div className="flex justify-between items-center ml-1">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-muted">Password</Label>
                    <Link to="/forgot-password" size="sm" className="text-[10px] font-black uppercase tracking-widest text-brand hover:underline">Forgot?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ui-muted group-focus-within:text-brand transition-colors" />
                    <Input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••" 
                        className="h-14 pl-12 pr-12 rounded-2xl bg-ui-bg-alt border-ui-border font-bold text-ui-text-main" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-ui-muted hover:text-brand transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-8 rounded-2xl bg-brand hover:bg-brand-hover text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-brand/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                    {loading ? 'Verifying...' : 'Sign In'}
                    {!loading && <ChevronRight className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-ui-border"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-ui-white px-4 text-ui-muted font-black tracking-widest">Or continue with</span></div>
            </div>

            <Button
              variant="outline"
              className="w-full py-7 rounded-2xl border-2 border-ui-border font-black uppercase tracking-widest text-[10px] hover:bg-ui-bg-alt transition-all"
              onClick={() => window.location.href = "http://127.0.0.1:8000/accounts/google/login/?process=login"}
            >
              <svg className="h-4 w-4 mr-3" aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google Account
            </Button>

            <div className="text-center pt-2">
              <p className="text-sm font-medium text-ui-muted">
                New to the network?{' '}
                <Link to="/signup" className="font-black text-brand hover:underline transition-all">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
