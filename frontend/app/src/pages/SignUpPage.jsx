import React, { useState } from 'react';
import { register } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SignUpPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password1: '',
    password2: '',
    account_type: 'traveller', // Default to traveller
    country: '',
    bio: '',
    travelStyle: '',
  });
  
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors([]); // Clear errors when typing
  };

  const validateStep1 = () => {
    const newErrors = [];
    if (!formData.email) newErrors.push("Email is required.");
    if (!formData.username) newErrors.push("Username is required.");
    if (!formData.password1) newErrors.push("Password is required.");
    if (formData.password1 !== formData.password2) newErrors.push("Passwords do not match.");
    // Basic password strength
    if (formData.password1 && formData.password1.length < 8) newErrors.push("Password must be at least 8 characters.");
    return newErrors;
  };

  const nextStep = () => {
    let stepErrors = [];
    if (step === 1) stepErrors = validateStep1();
    
    if (stepErrors.length > 0) {
      setErrors(stepErrors);
    } else {
      setStep(s => s + 1);
    }
  };

  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) return; // Prevent enter key submission on early steps

    setLoading(true);
    setErrors([]);

    const { email, username, password1, password2, account_type } = formData;
    const finalFormData = { email, username, password1, password2, account_type };

    try {
      const response = await register(finalFormData);
      
      if (response.data.key) {
        login(response.data.key, { email, username, account_type });
        navigate('/app'); // Redirect to app directly since we collected profile info
      } else {
        alert('Registration successful! You can now sign in.');
        navigate('/signin'); 
      }
    } catch (err) {
      console.error('Registration error:', err.response ? err.response.data : err.message);
      
      // Parse backend errors beautifully
      if (err.response?.data) {
        const backendErrors = [];
        Object.entries(err.response.data).forEach(([key, messages]) => {
           if (Array.isArray(messages)) {
             backendErrors.push(`${key}: ${messages[0]}`);
           } else {
             backendErrors.push(messages);
           }
        });
        setErrors(backendErrors);
      } else {
        setErrors([err.message]);
      }
      setStep(1); // Go back to step 1 to show account errors
    } finally {
      setLoading(false);
    }
  };

  // Common countries for the dropdown
  const countries = [
    "United States", "United Kingdom", "Canada", "Australia", 
    "Germany", "France", "Spain", "Italy", "Japan", "Brazil", 
    "Ethiopia", "Kenya", "South Africa", "Other"
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-linkler-bg)] p-4 sm:p-8">
      <div className="flex w-full max-w-5xl mx-auto bg-ui-white rounded-3xl shadow-xl overflow-hidden min-h-[650px] border border-ui-border">
        {/* Left Column (Branding/Illustration) - Hidden on mobile */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-indigo-700 to-purple-800 text-white relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight">Join Linkler Today</h1>
            <p className="text-purple-100 text-lg leading-relaxed">
              Connect with travelers, book expert guides, and discover the world's best kept secrets.
            </p>
          </div>

          <div className="relative z-10 w-full flex-grow flex items-center justify-center">
             <div className="w-72 h-72 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl p-8 rotate-3 transition-transform hover:rotate-0 duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-white/90">
                  <path fillRule="evenodd" d="M3.193 11.23a.75.75 0 011.082-.01l8.527 8.528A2.25 2.25 0 0016.63 19H20.25a.75.75 0 00.75-.75V14.63a2.25 2.25 0 00-.659-1.591L11.83 4.54a.75.75 0 00-1.06 0l-7.5 7.5a.75.75 0 00-.077 1.19z" clipRule="evenodd" />
                  <path d="M15.42 2.162a.75.75 0 011.058.079l2.25 2.519a.75.75 0 01-1.116 1.002l-.99-.111v1.171a.75.75 0 01-1.5 0V3.22a.75.75 0 01.3-.058z" />
                </svg>
             </div>
          </div>
          
          <div className="relative z-10 text-sm font-medium text-purple-200 flex items-center gap-4">
             <div className="flex -space-x-2">
               {[1,2,3].map(i => (
                 <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-700 bg-white/20 flex items-center justify-center backdrop-blur-sm text-xs font-bold">
                   UI
                 </div>
               ))}
             </div>
             <span>Join 10,000+ travelers</span>
          </div>
        </div>

        {/* Right Column (Form Wizard) */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-ui-white relative">
          
          {/* Progress Indicator */}
          <div className="absolute top-8 left-0 w-full px-8 sm:px-12 lg:px-16 flex justify-between items-center z-20">
             <div className="flex gap-2 items-center w-full">
               {[1, 2, 3].map((num) => (
                 <div key={num} className="flex-1 h-1.5 rounded-full overflow-hidden bg-ui-bg-alt relative">
                   <div 
                     className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 bg-indigo-600`}
                     style={{ width: step >= num ? '100%' : '0%' }}
                   />
                 </div>
               ))}
             </div>
          </div>

          <div className="w-full max-w-sm mx-auto space-y-6 mt-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-ui-text-main tracking-tight">
                {step === 1 && "Create Account"}
                {step === 2 && "Personal Details"}
                {step === 3 && "Travel Preferences"}
              </h2>
              <p className="mt-2 text-sm text-ui-text-secondary">
                {step === 1 && "Start your journey with us."}
                {step === 2 && "Tell us a bit about yourself."}
                {step === 3 && "Help us tailor your experience."}
              </p>
            </div>

            {errors.length > 0 && (
              <div className="p-4 text-sm text-error bg-error-light/10 border border-error/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-2 items-center font-semibold mb-1 text-error">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Please fix the following:
                </div>
                <ul className="list-disc pl-6 space-y-1 text-error">
                  {errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* STEP 1: ACCOUNT */}
              <div className={`space-y-5 transition-all duration-300 ${step === 1 ? 'block animate-in slide-in-from-right-4' : 'hidden'}`}>
                <div className="space-y-3">
                  <Label className="text-ui-text-main">I am signing up as a:</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <label className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${formData.account_type === 'traveller' ? 'border-indigo-600 bg-indigo-600/10 shadow-sm' : 'border-ui-border hover:border-indigo-300 hover:bg-ui-bg-alt'}`}>
                      <input type="radio" name="account_type" value="traveller" checked={formData.account_type === 'traveller'} onChange={handleChange} className="sr-only" />
                      <span className="text-xl mb-1">🎒</span>
                      <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${formData.account_type === 'traveller' ? 'text-indigo-600' : 'text-ui-text-secondary'}`}>Travellers</span>
                    </label>
                    <label className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${formData.account_type === 'guide' ? 'border-indigo-600 bg-indigo-600/10 shadow-sm' : 'border-ui-border hover:border-indigo-300 hover:bg-ui-bg-alt'}`}>
                      <input type="radio" name="account_type" value="guide" checked={formData.account_type === 'guide'} onChange={handleChange} className="sr-only" />
                      <span className="text-xl mb-1">🗺️</span>
                      <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${formData.account_type === 'guide' ? 'text-indigo-600' : 'text-ui-text-secondary'}`}>Guides</span>
                    </label>
                    <label className={`flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${formData.account_type === 'service' ? 'border-indigo-600 bg-indigo-600/10 shadow-sm' : 'border-ui-border hover:border-indigo-300 hover:bg-ui-bg-alt'}`}>
                      <input type="radio" name="account_type" value="service" checked={formData.account_type === 'service'} onChange={handleChange} className="sr-only" />
                      <span className="text-xl mb-1">🏢</span>
                      <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${formData.account_type === 'service' ? 'text-indigo-600' : 'text-ui-text-secondary'}`}>Services</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-ui-text-main">Email Address</Label>
                  <Input name="email" type="email" value={formData.email} onChange={handleChange} required={step===1} placeholder="you@example.com" className="bg-ui-bg-alt border-ui-border text-ui-text-main" />
                </div>
                <div className="space-y-2">
                  <Label className="text-ui-text-main">Username</Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-ui-muted font-medium">@</span>
                    <Input name="username" type="text" value={formData.username} onChange={handleChange} required={step===1} placeholder="traveler123" className="pl-9 bg-ui-bg-alt border-ui-border text-ui-text-main" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-ui-text-main">Password</Label>
                    <Input name="password1" type="password" value={formData.password1} onChange={handleChange} required={step===1} placeholder="••••••••" className="bg-ui-bg-alt border-ui-border text-ui-text-main" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-ui-text-main">Confirm</Label>
                    <Input name="password2" type="password" value={formData.password2} onChange={handleChange} required={step===1} placeholder="••••••••" className="bg-ui-bg-alt border-ui-border text-ui-text-main" />
                  </div>
                </div>
              </div>

              {/* STEP 2: PERSONAL */}
              <div className={`space-y-5 transition-all duration-300 ${step === 2 ? 'block animate-in slide-in-from-right-4' : 'hidden'}`}>
                <div className="space-y-2">
                  <Label className="text-ui-text-main">Country of Residence</Label>
                  <div className="relative">
                    <select name="country" value={formData.country} onChange={handleChange} required={step===2} className="flex h-10 w-full items-center justify-between rounded-md border border-ui-border bg-ui-bg-alt px-3 py-2 text-sm text-ui-text-main ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer">
                      <option value="" disabled className="bg-ui-bg">Select your country</option>
                      {countries.map(c => <option key={c} value={c} className="bg-ui-bg">{c}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-ui-muted">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-ui-text-main">Short Bio (Optional)</Label>
                  <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="I love exploring historical sites and trying new foods..." rows={3} className="flex min-h-[80px] w-full rounded-md border border-ui-border bg-ui-bg-alt px-3 py-2 text-sm text-ui-text-main ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none" />
                </div>
              </div>

              {/* STEP 3: PREFERENCES */}
              <div className={`space-y-6 transition-all duration-300 ${step === 3 ? 'block animate-in slide-in-from-right-4' : 'hidden'}`}>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-ui-text-main mb-2">What is your primary travel style?</label>
                  {['Budget Backpacker', 'Luxury Explorer', 'Cultural Enthusiast', 'Thrill Seeker'].map((style) => (
                    <label key={style} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${formData.travelStyle === style ? 'border-indigo-600 bg-indigo-600/10' : 'border-ui-border hover:bg-ui-bg-alt'}`}>
                      <input type="radio" name="travelStyle" value={style} checked={formData.travelStyle === style} onChange={handleChange} className="w-4 h-4 text-indigo-600 border-ui-border focus:ring-indigo-500 bg-ui-bg-alt" />
                      <span className={`ml-3 text-sm font-medium ${formData.travelStyle === style ? 'text-indigo-600' : 'text-ui-text-main'}`}>{style}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep} className="w-1/3 text-lg py-5 border-ui-border text-ui-text-main hover:bg-ui-bg-alt">
                    Back
                  </Button>
                )}
                {step < 3 ? (
                  <Button type="button" onClick={nextStep} className={`${step > 1 ? 'w-2/3' : 'w-full'} text-lg py-5 bg-indigo-600 hover:bg-indigo-700 text-white`}>
                    Continue
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading || !formData.travelStyle} className={`${step > 1 ? 'w-2/3' : 'w-full'} text-lg py-5 bg-indigo-600 hover:bg-indigo-700 text-white`}>
                    {loading ? 'Creating...' : 'Complete Sign Up'}
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-8 text-center border-t border-ui-border pt-6">
              <p className="text-sm text-ui-text-secondary">
                Already have an account?{' '}
                <Link to="/signin" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
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
