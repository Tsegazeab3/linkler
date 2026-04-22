import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile, uploadVerificationDoc } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Camera, User, Check, ChevronRight, ChevronLeft, Upload, Briefcase, Globe, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfileCompletionPage = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // Index in visibleSteps
  const [formData, setFormData] = useState({
    age: '',
    nationality: '',
    phone_no: '',
    city: '',
    country: '',
    bio: '',
    account_type: 'traveller',
    profile_picture: null,
  });
  const [profilePreview, setProfilePreview] = useState(null);
  const [idFile, setIdFile] = useState(null);
  const [visaFile, setVisaFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define logic for "Smart Setup"
  const isFieldMissing = (fieldName) => user?.missing_fields?.includes(fieldName);

  const allSteps = [
    { 
        id: 'account_type', 
        title: "Account Type", 
        description: "How will you use Linkler?",
        fields: ['account_type'],
        show: isFieldMissing('account_type') || !user?.account_type 
    },
    { 
        id: 'basic_info', 
        title: "Basic Info", 
        description: "Help us know you better.",
        fields: ['age', 'nationality', 'phone_no'],
        show: isFieldMissing('age') || isFieldMissing('nationality') || isFieldMissing('phone_no')
    },
    { 
        id: 'location', 
        title: "Location", 
        description: "Where are you based?",
        fields: ['city', 'country'],
        show: isFieldMissing('city') || isFieldMissing('country')
    },
    { 
        id: 'about', 
        title: "About You", 
        description: "Your bio and profile picture.",
        fields: ['bio', 'profile_picture'],
        show: isFieldMissing('bio') || isFieldMissing('profile_picture')
    },
    {
        id: 'verification',
        title: "Verification",
        description: "Required for Guides and Services.",
        fields: ['verification_id', 'verification_visa'],
        show: (user?.account_type === 'guide' || user?.account_type === 'service') && (isFieldMissing('verification_id') || isFieldMissing('verification_visa'))
    }
  ];

  const visibleSteps = allSteps.filter(s => s.show);
  const currentStepData = visibleSteps[step];

  useEffect(() => {
    if (user) {
        setFormData(prev => ({ ...prev, ...user }));
        if (user.profile_picture) setProfilePreview(user.profile_picture);
        
        // If everything is done, go home
        if (user.is_profile_complete && user.onboarding_completed) {
            navigate('/app');
        }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, profile_picture: file }));
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleNext = () => {
    if (step < visibleSteps.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const loadingToast = toast.loading("Saving your profile...");
    try {
      const dataToSend = new FormData();
      // Only send fields that are actually in the form data
      Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined && key !== 'missing_fields' && key !== 'unread_notifications_count' && key !== 'posts' && key !== 'followers_count' && key !== 'following_count' && key !== 'posts_count' && key !== 'rating' && key !== 'review_count' && key !== 'verification_status' && key !== 'is_profile_complete') {
              dataToSend.append(key, formData[key]);
          }
      });

      await updateProfile(dataToSend);

      // Handle document uploads if present
      if (idFile) {
        const idFd = new FormData();
        idFd.append('document_type', 'id');
        idFd.append('file', idFile);
        await uploadVerificationDoc(idFd);
      }
      if (visaFile) {
        const visaFd = new FormData();
        visaFd.append('document_type', 'visa');
        visaFd.append('file', visaFile);
        await uploadVerificationDoc(visaFd);
      }

      await refreshProfile();
      toast.success("Profile updated!", { id: loadingToast });
      
      // If we still have missing onboarding questionnaire, AuthGuard will handle it
      if (user?.missing_fields.includes('onboarding_questionnaire')) {
          navigate('/app/onboarding');
      } else {
          navigate('/app');
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile.", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentStepData) return null;

  return (
    <div className="min-h-screen bg-ui-bg flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-500">
      <Card className="w-full max-w-2xl bg-ui-white/95 backdrop-blur-md shadow-2xl border-none rounded-[3rem] overflow-hidden">
        <div className="bg-brand h-2 w-full">
            <div 
                className="bg-accent-indigo h-full transition-all duration-500" 
                style={{ width: `${((step + 1) / visibleSteps.length) * 100}%` }}
            />
        </div>
        
        <CardHeader className="p-10 pb-6">
          <div className="flex justify-between items-center mb-4">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand">Completion Step {step + 1} of {visibleSteps.length}</span>
             <User className="w-6 h-6 text-ui-muted opacity-20" />
          </div>
          <CardTitle className="text-4xl font-black italic uppercase tracking-tighter text-ui-text-main leading-none">{currentStepData.title}</CardTitle>
          <CardDescription className="text-sm font-medium text-ui-muted mt-2">{currentStepData.description}</CardDescription>
        </CardHeader>

        <CardContent className="p-10 pt-4 space-y-8">
            {currentStepData.id === 'account_type' && (
                <div className="grid grid-cols-2 gap-4">
                    {['traveller', 'guide'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFormData({...formData, account_type: type})}
                            className={`flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 transition-all ${formData.account_type === type ? 'border-brand bg-brand/5 shadow-lg' : 'border-ui-border bg-ui-bg-alt/50 opacity-60'}`}
                        >
                            <span className="text-4xl mb-4">{type === 'traveller' ? '🎒' : '🗺️'}</span>
                            <span className="font-black uppercase tracking-widest text-[10px]">{type}</span>
                        </button>
                    ))}
                </div>
            )}

            {currentStepData.id === 'basic_info' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1">Age</Label>
                            <Input name="age" type="number" value={formData.age} onChange={handleChange} className="h-14 rounded-2xl bg-ui-bg-alt border-none font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1">Nationality</Label>
                            <Input name="nationality" value={formData.nationality} onChange={handleChange} className="h-14 rounded-2xl bg-ui-bg-alt border-none font-bold" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1">Phone Number</Label>
                        <Input name="phone_no" value={formData.phone_no} onChange={handleChange} placeholder="+971 ..." className="h-14 rounded-2xl bg-ui-bg-alt border-none font-bold" />
                    </div>
                </div>
            )}

            {currentStepData.id === 'location' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1">City</Label>
                        <Input name="city" value={formData.city} onChange={handleChange} className="h-14 rounded-2xl bg-ui-bg-alt border-none font-bold" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1">Country</Label>
                        <Input name="country" value={formData.country} onChange={handleChange} className="h-14 rounded-2xl bg-ui-bg-alt border-none font-bold" />
                    </div>
                </div>
            )}

            {currentStepData.id === 'about' && (
                <div className="space-y-8">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <Avatar className="w-32 h-32 border-4 border-white shadow-2xl ring-1 ring-ui-border/50">
                                <AvatarImage src={profilePreview} className="object-cover" />
                                <AvatarFallback className="bg-brand-light text-brand text-4xl font-black">{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                <Camera className="w-8 h-8" />
                                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                            </label>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand">Tap to upload photo</p>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-ui-muted ml-1">Bio / Narrative</Label>
                        <Textarea 
                            name="bio" 
                            value={formData.bio} 
                            onChange={handleChange} 
                            placeholder="Tell the community about your travel philosophy..."
                            className="min-h-[120px] rounded-[1.8rem] bg-ui-bg-alt border-none focus:ring-2 focus:ring-brand/20 font-medium italic p-6"
                        />
                    </div>
                </div>
            )}

            {currentStepData.id === 'verification' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={`p-8 rounded-[2rem] border-2 border-dashed transition-all relative group ${idFile ? 'border-success bg-success/5' : 'border-ui-border bg-ui-bg-alt hover:border-brand/30'}`}>
                            <div className="flex flex-col items-center text-center">
                                {idFile ? <CheckCircle2 className="w-8 h-8 text-success mb-2" /> : <FileText className="w-8 h-8 text-ui-muted mb-2 group-hover:text-brand transition-colors" />}
                                <p className="text-[10px] font-black uppercase tracking-widest text-ui-text-main">Gov. Issued ID</p>
                                <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                    onChange={(e) => setIdFile(e.target.files[0])}
                                    accept="image/*,.pdf"
                                />
                                {idFile && <p className="text-[8px] font-bold text-success mt-2 truncate max-w-full">{idFile.name}</p>}
                            </div>
                        </div>

                        <div className={`p-8 rounded-[2rem] border-2 border-dashed transition-all relative group ${visaFile ? 'border-success bg-success/5' : 'border-ui-border bg-ui-bg-alt hover:border-brand/30'}`}>
                            <div className="flex flex-col items-center text-center">
                                {visaFile ? <CheckCircle2 className="w-8 h-8 text-success mb-2" /> : <Upload className="w-8 h-8 text-ui-muted mb-2 group-hover:text-brand transition-colors" />}
                                <p className="text-[10px] font-black uppercase tracking-widest text-ui-text-main">Residency / Visa</p>
                                <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                    onChange={(e) => setVisaFile(e.target.files[0])}
                                    accept="image/*,.pdf"
                                />
                                {visaFile && <p className="text-[8px] font-bold text-success mt-2 truncate max-w-full">{visaFile.name}</p>}
                            </div>
                        </div>
                    </div>
                    <p className="text-[11px] text-ui-muted font-medium text-center italic opacity-60">Legal documentation is required for UAE-based providers to ensure community safety.</p>
                </div>
            )}
        </CardContent>

        <CardFooter className="p-10 bg-ui-bg-alt/30 border-t border-ui-border/50 flex justify-between gap-4">
          {step > 0 && (
            <Button variant="ghost" onClick={handleBack} className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px]">
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          )}
          <Button 
            onClick={handleNext} 
            disabled={isSubmitting}
            className="flex-[2] h-14 rounded-2xl bg-brand hover:bg-brand-hover text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-brand/20"
          >
            {isSubmitting ? "Saving..." : step === visibleSteps.length - 1 ? "Complete Setup" : "Continue"}
            {!isSubmitting && <ChevronRight className="ml-2 w-4 h-4" />}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfileCompletionPage;
