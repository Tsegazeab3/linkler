import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitTravelerOnboarding } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
    Compass, 
    ChevronRight,
    ChevronLeft,
    Check,
    Globe,
    MapPin,
    Plus,
    X,
    Target
} from "lucide-react";

const TravelerOnboardingPage = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        interests: [],
        past_adventures: [], // List of {country, purpose, duration, motivation}
        future_intentions: [], // List of {destination, timeline, purpose, motivation}
        job_industry: '',
        travel_flexibility: 'Medium',
        budget_range: 'Mid-range',
        travel_style: 'Balanced',
        group_preference: 'Small Group'
    });

    // Helper state for adding a single travel item
    const [currentPast, setCurrentPast] = useState({ country: '', purpose: 'Leisure', duration: '', motivation: '' });
    const [currentFuture, setCurrentFuture] = useState({ destination: '', timeline: '', purpose: 'Leisure', motivation: '' });

    const travelInterests = [
        { id: 'adventure', label: 'Adventure' },
        { id: 'culture', label: 'Culture' },
        { id: 'food', label: 'Food & Dining' },
        { id: 'luxury', label: 'Luxury' },
        { id: 'budget', label: 'Budget-friendly' },
        { id: 'nature', label: 'Nature & Outdoors' },
        { id: 'history', label: 'History' },
        { id: 'nightlife', label: 'Nightlife' }
    ];

    const countries = [
        "United States", "United Kingdom", "Canada", "Australia", 
        "Germany", "France", "Spain", "Italy", "Japan", "Brazil", 
        "United Arab Emirates", "Thailand", "South Africa", "Other"
    ];

    const purposes = ["Leisure", "Work", "Education", "Volunteering", "Family", "Digital Nomad"];

    const handleInterestToggle = (id) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(id) 
                ? prev.interests.filter(i => i !== id)
                : [...prev.interests, id]
        }));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addPastAdventure = () => {
        if (!currentPast.country) {
            toast.error("Please select a country");
            return;
        }
        setFormData(prev => ({
            ...prev,
            past_adventures: [...prev.past_adventures, currentPast]
        }));
        setCurrentPast({ country: '', purpose: 'Leisure', duration: '', motivation: '' });
    };

    const removePastAdventure = (index) => {
        setFormData(prev => ({
            ...prev,
            past_adventures: prev.past_adventures.filter((_, i) => i !== index)
        }));
    };

    const addFutureIntention = () => {
        if (!currentFuture.destination) {
            toast.error("Please enter a destination");
            return;
        }
        setFormData(prev => ({
            ...prev,
            future_intentions: [...prev.future_intentions, currentFuture]
        }));
        setCurrentFuture({ destination: '', timeline: '', purpose: 'Leisure', motivation: '' });
    };

    const removeFutureIntention = (index) => {
        setFormData(prev => ({
            ...prev,
            future_intentions: prev.future_intentions.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await submitTravelerOnboarding(formData);
            toast.success("Questionnaire complete!", {
                description: user?.account_type === 'guide' ? "Now, let's verify your identity." : "Welcome aboard!"
            });
            await refreshProfile();
            
            // Redirect based on account type
            if (user?.account_type === 'guide' || user?.account_type === 'service') {
                navigate('/app/verify');
            } else {
                navigate('/app');
            }
        } catch (err) {
            console.error(err);
            toast.error("Submission failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    return (
        <div className="min-h-screen bg-ui-bg flex items-center justify-center p-4 md:p-8">
            <Card className="max-w-2xl w-full rounded-[3rem] border-none shadow-2xl overflow-hidden bg-ui-white">
                <div className="bg-brand h-2 w-full">
                    <div 
                        className="bg-accent-indigo h-full transition-all duration-500" 
                        style={{ width: `${(step / 5) * 100}%` }}
                    />
                </div>

                <CardHeader className="p-10 pb-6">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand">Onboarding Step {step} of 5</span>
                        <Globe className="w-6 h-6 text-ui-muted opacity-20" />
                    </div>
                    <CardTitle className="text-4xl font-black italic uppercase tracking-tighter text-ui-text-main leading-none">
                        {step === 1 && "Travel Passions"}
                        {step === 2 && "Past Adventures"}
                        {step === 3 && "Future Intentions"}
                        {step === 4 && "Professional Profile"}
                        {step === 5 && "Personal Style"}
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-10 pt-4 max-h-[60vh] overflow-y-auto no-scrollbar">
                    {step === 1 && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
                            {travelInterests.map(interest => (
                                <button
                                    key={interest.id}
                                    onClick={() => handleInterestToggle(interest.id)}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${formData.interests.includes(interest.id) ? 'border-brand bg-brand/5 text-brand shadow-lg' : 'border-ui-border bg-ui-bg-alt text-ui-text-secondary hover:bg-ui-white'}`}
                                >
                                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${formData.interests.includes(interest.id) ? 'bg-brand border-brand text-white' : 'border-ui-muted/30 bg-ui-bg-alt'}`}>
                                        {formData.interests.includes(interest.id) && <Check className="w-3 h-3 stroke-[4]" />}
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest">{interest.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="p-6 bg-ui-bg-alt rounded-[2rem] border border-ui-border space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand">Add Visited Country</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-[9px] uppercase font-bold text-ui-muted ml-1">Country</Label>
                                        <select 
                                            value={currentPast.country} 
                                            onChange={(e) => setCurrentPast({...currentPast, country: e.target.value})}
                                            className="w-full h-10 px-3 rounded-xl bg-ui-white border border-ui-border text-sm font-bold text-ui-text-main"
                                        >
                                            <option value="">Select...</option>
                                            {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[9px] uppercase font-bold text-ui-muted ml-1">Purpose</Label>
                                        <select 
                                            value={currentPast.purpose} 
                                            onChange={(e) => setCurrentPast({...currentPast, purpose: e.target.value})}
                                            className="w-full h-10 px-3 rounded-xl bg-ui-white border border-ui-border text-sm font-bold text-ui-text-main"
                                        >
                                            {purposes.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[9px] uppercase font-bold text-ui-muted ml-1">Motivation for choosing this country</Label>
                                    <select 
                                        value={currentPast.motivation} 
                                        onChange={(e) => setCurrentPast({...currentPast, motivation: e.target.value})}
                                        className="w-full h-10 px-3 rounded-xl bg-ui-white border border-ui-border text-sm font-bold text-ui-text-main"
                                    >
                                        <option value="">Select primary reason...</option>
                                        <option value="Cultural Sightseeing">Cultural Sightseeing</option>
                                        <option value="Adventure & Sports">Adventure & Sports</option>
                                        <option value="Gastronomy">Gastronomy</option>
                                        <option value="Relaxation">Relaxation</option>
                                        <option value="Business Networking">Business Networking</option>
                                    </select>
                                </div>
                                <Button onClick={addPastAdventure} className="w-full h-10 rounded-xl font-bold uppercase tracking-widest text-[9px] bg-brand text-white">
                                    <Plus className="w-3 h-3 mr-2" /> Log Adventure
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {formData.past_adventures.map((adv, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-ui-white border border-ui-border rounded-2xl shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-ui-text-main">{adv.country}</p>
                                                <p className="text-[9px] text-ui-muted uppercase font-bold tracking-widest">{adv.purpose} • {adv.motivation}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => removePastAdventure(idx)} className="p-2 text-ui-muted hover:text-error transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="p-6 bg-ui-bg-alt rounded-[2rem] border border-ui-border space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand">Add Dream Destination</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-[9px] uppercase font-bold text-ui-muted ml-1">Where to?</Label>
                                        <Input 
                                            value={currentFuture.destination} 
                                            onChange={(e) => setCurrentFuture({...currentFuture, destination: e.target.value})}
                                            placeholder="City or Country"
                                            className="h-10 rounded-xl bg-ui-white border-ui-border text-ui-text-main"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[9px] uppercase font-bold text-ui-muted ml-1">Timeline</Label>
                                        <select 
                                            value={currentFuture.timeline} 
                                            onChange={(e) => setCurrentFuture({...currentFuture, timeline: e.target.value})}
                                            className="w-full h-10 px-3 rounded-xl bg-ui-white border border-ui-border text-sm font-bold text-ui-text-main"
                                        >
                                            <option value="">When?</option>
                                            <option value="Next 3 months">Next 3 months</option>
                                            <option value="Next 6 months">Next 6 months</option>
                                            <option value="Within a year">Within a year</option>
                                            <option value="Someday">Someday</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[9px] uppercase font-bold text-ui-muted ml-1">What is the motivation?</Label>
                                    <select 
                                        value={currentFuture.motivation} 
                                        onChange={(e) => setCurrentFuture({...currentFuture, motivation: e.target.value})}
                                        className="w-full h-10 px-3 rounded-xl bg-ui-white border border-ui-border text-sm font-bold text-ui-text-main"
                                    >
                                        <option value="">Select reason...</option>
                                        <option value="Iconic Landmarks">Iconic Landmarks</option>
                                        <option value="Unique Nature">Unique Nature</option>
                                        <option value="Food Scene">Food Scene</option>
                                        <option value="Local Culture">Local Culture</option>
                                        <option value="Specific Event">Specific Event</option>
                                    </select>
                                </div>
                                <Button onClick={addFutureIntention} className="w-full h-10 rounded-xl font-bold uppercase tracking-widest text-[9px] bg-brand text-white">
                                    <Plus className="w-3 h-3 mr-2" /> Add Intention
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {formData.future_intentions.map((intent, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-ui-white border border-ui-border rounded-2xl shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-accent-indigo/10 flex items-center justify-center text-accent-indigo">
                                                <Target className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-ui-text-main">{intent.destination}</p>
                                                <p className="text-[9px] text-ui-muted uppercase font-bold tracking-widest">{intent.timeline} • {intent.motivation}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => removeFutureIntention(idx)} className="p-2 text-ui-muted hover:text-error transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1">Professional Job/Industry</Label>
                                <Input
                                    name="job_industry"
                                    value={formData.job_industry}
                                    onChange={handleChange}
                                    placeholder="e.g. Software Engineering, Healthcare"
                                    className="h-14 rounded-2xl bg-ui-bg-alt border-none font-bold text-ui-text-main"
                                />
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1">Travel Flexibility (Work/Time)</Label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Rigid', 'Medium', 'Digital Nomad'].map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setFormData({ ...formData, travel_flexibility: level })}
                                            className={`py-4 rounded-2xl border-2 transition-all text-[10px] font-black uppercase tracking-widest ${formData.travel_flexibility === level ? 'border-brand bg-brand/5 text-brand' : 'border-ui-border bg-ui-bg-alt text-ui-muted'}`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1">Budget Preference</Label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Budget', 'Mid-range', 'Luxury'].map(range => (
                                        <button
                                            key={range}
                                            onClick={() => setFormData({ ...formData, budget_range: range })}
                                            className={`py-4 rounded-2xl border-2 transition-all text-[10px] font-black uppercase tracking-widest ${formData.budget_range === range ? 'border-brand bg-brand/5 text-brand' : 'border-ui-border bg-ui-bg-alt text-ui-muted'}`}
                                        >
                                            {range}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1">Ideal Group Size</Label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Solo only', 'Small Group', 'Massive Group'].map(pref => (
                                        <button
                                            key={pref}
                                            onClick={() => setFormData({ ...formData, group_preference: pref })}
                                            className={`py-4 rounded-2xl border-2 transition-all text-[10px] font-black uppercase tracking-widest ${formData.group_preference === pref ? 'border-brand bg-brand/5 text-brand' : 'border-ui-border bg-ui-bg-alt text-ui-muted'}`}
                                        >
                                            {pref}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="p-10 bg-ui-bg-alt/30 border-t border-ui-border/50 flex justify-between gap-4">
                    {step > 1 && (
                        <Button 
                            variant="outline" 
                            onClick={prevStep} 
                            className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] border-ui-border text-ui-text-main"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                    )}
                    {step < 5 ? (
                        <Button 
                            onClick={nextStep} 
                            className={`h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl ${step === 1 ? 'w-full' : 'flex-1'}`}
                        >
                            Continue <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button 
                            onClick={handleSubmit} 
                            disabled={loading}
                            className="flex-1 h-14 rounded-2xl bg-success hover:bg-success-hover text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-success/20"
                        >
                            {loading ? "Optimizing Experience..." : "Complete Discovery"}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
};

export default TravelerOnboardingPage;
