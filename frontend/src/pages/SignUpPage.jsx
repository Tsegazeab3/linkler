import React, { useState } from 'react';
import { register } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

function SignUpPage() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password1: '',
    password2: '',
    account_type: 'traveller', 
  });
  
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors([]); 
  };

  const validate = () => {
    const newErrors = [];
    if (!formData.email) newErrors.push("Email is required.");
    if (!formData.username) newErrors.push("Username is required.");
    if (!formData.password1) newErrors.push("Password is required.");
    if (formData.password1 !== formData.password2) newErrors.push("Passwords do not match.");
    if (formData.password1 && formData.password1.length < 8) newErrors.push("Password must be at least 8 characters.");
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valErrors = validate();
    if (valErrors.length > 0) {
      setErrors(valErrors);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      const response = await register(formData);
      if (response.data.key) {
        login(response.data.key, { 
            email: formData.email, 
            username: formData.username, 
            account_type: formData.account_type,
            onboarding_completed: false 
        });
        toast.success("Account created successfully!");
        navigate('/app'); 
      } else {
        toast.success("Account created!", { description: "Please sign in to continue." });
        navigate('/signin'); 
      }
    } catch (err) {
      console.error('Registration error:', err.response ? err.response.data : err.message);
      if (err.response?.data) {
        const backendErrors = [];
        Object.entries(err.response.data).forEach(([key, messages]) => {
           backendErrors.push(`${key}: ${Array.isArray(messages) ? messages[0] : messages}`);
        });
        setErrors(backendErrors);
      } else {
        setErrors([err.message]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-linkler-bg)] p-4 sm:p-8">
      <div className="flex w-full max-w-5xl mx-auto bg-ui-white rounded-[3rem] shadow-2xl overflow-hidden min-h-[700px] border border-ui-border">
        {/* Left Column */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 bg-gradient-to-br from-brand to-accent-indigo text-white relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 space-y-6">
            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">The Future of Exploration.</h1>
            <p className="text-white/80 text-lg leading-relaxed font-medium">
              Join a global network of explorers and verified guides. Your next journey starts with a single click.
            </p>
          </div>

          <div className="relative z-10 w-full flex-grow flex items-center justify-center py-12">
             <div className="w-80 h-80 bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 flex items-center justify-center shadow-[0_50px_100px_rgba(0,0,0,0.2)] p-12 -rotate-3 transition-all hover:rotate-0 hover:scale-105 duration-700 group">
                <Compass className="w-full h-full text-white/90 animate-in zoom-in-75 duration-700 group-hover:rotate-45 transition-transform" strokeWidth={1} />
             </div>
          </div>
          
          <div className="relative z-10 flex items-center gap-6">
             <div className="flex -space-x-4">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-12 h-12 rounded-full border-[3px] border-brand bg-ui-bg-alt flex items-center justify-center text-[10px] font-black shadow-lg">
                   U{i}
                 </div>
               ))}
             </div>
             <div>
                <p className="text-sm font-black uppercase tracking-widest">Join 10k+ Travelers</p>
                <p className="text-xs text-white/60 font-bold uppercase tracking-[0.2em]">Verified Community</p>
             </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-20 flex flex-col justify-center bg-ui-white">
          <div className="w-full max-w-sm mx-auto space-y-10">
            <div className="text-center lg:text-left space-y-2">
              <h2 className="text-4xl font-black text-ui-text-main italic tracking-tighter uppercase">Sign Up</h2>
              <p className="text-sm font-medium text-ui-muted">Ready to explore? Create your account below.</p>
            </div>

            {errors.length > 0 && (
                <div className="p-4 bg-error-light/10 border border-error/20 rounded-2xl space-y-1 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-error">⚠️</span>
                        <p className="text-[10px] font-black uppercase tracking-widest text-error font-black">Account Required</p>
                    </div>
                    {errors.map((err, i) => (
                        <p key={i} className="text-xs font-bold text-error/80 ml-6">• {err}</p>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-ui-muted ml-1">Account Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all active:scale-95 ${formData.account_type === 'traveller' ? 'border-brand bg-brand/5 shadow-lg shadow-brand/10' : 'border-ui-border hover:bg-ui-bg-alt opacity-60'}`}>
                      <input type="radio" name="account_type" value="traveller" checked={formData.account_type === 'traveller'} onChange={handleChange} className="sr-only" />
                      <span className="text-2xl mb-2">🎒</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${formData.account_type === 'traveller' ? 'text-brand' : 'text-ui-text-secondary'}`}>Traveller</span>
                    </label>
                    <label className={`flex flex-col items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all active:scale-95 ${formData.account_type === 'guide' ? 'border-brand bg-brand/5 shadow-lg shadow-brand/10' : 'border-ui-border hover:bg-ui-bg-alt opacity-60'}`}>
                      <input type="radio" name="account_type" value="guide" checked={formData.account_type === 'guide'} onChange={handleChange} className="sr-only" />
                      <span className="text-2xl mb-2">🗺️</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${formData.account_type === 'guide' ? 'text-brand' : 'text-ui-text-secondary'}`}>Guide</span>
                    </label>
                  </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2 group">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-muted ml-1">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ui-muted group-focus-within:text-brand transition-colors" />
                    <Input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="name@email.com" className="h-12 pl-12 rounded-xl bg-ui-bg-alt border-ui-border text-ui-text-main" autoFocus />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-muted ml-1">Username</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ui-muted group-focus-within:text-brand transition-colors" />
                    <Input name="username" type="text" value={formData.username} onChange={handleChange} required placeholder="traveler123" className="h-12 pl-12 rounded-xl bg-ui-bg-alt border-ui-border text-ui-text-main" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 group">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-muted ml-1">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ui-muted group-focus-within:text-brand transition-colors" />
                      <Input 
                        name="password1" 
                        type={showPassword1 ? "text" : "password"} 
                        value={formData.password1} 
                        onChange={handleChange} 
                        required 
                        placeholder="••••••••" 
                        className="h-12 pl-12 pr-12 rounded-xl bg-ui-bg-alt border-ui-border text-ui-text-main" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword1(!showPassword1)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-ui-muted hover:text-brand transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-muted ml-1">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ui-muted group-focus-within:text-brand transition-colors" />
                      <Input 
                        name="password2" 
                        type={showPassword2 ? "text" : "password"} 
                        value={formData.password2} 
                        onChange={handleChange} 
                        required 
                        placeholder="••••••••" 
                        className="h-12 pl-12 pr-12 rounded-xl bg-ui-bg-alt border-ui-border text-ui-text-main" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword2(!showPassword2)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-ui-muted hover:text-brand transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-7 rounded-2xl bg-brand hover:bg-brand-hover text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-brand/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                    {loading ? 'Creating Profile...' : 'Start Exploring'}
                    {!loading && <ChevronRight className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            </form>

            <div className="text-center pt-6">
              <p className="text-sm font-medium text-ui-muted">
                Already part of the network?{' '}
                <Link to="/signin" className="font-black text-brand hover:underline transition-all">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
