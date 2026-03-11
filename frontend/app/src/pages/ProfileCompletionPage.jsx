import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Camera, User, Check, ChevronRight, ChevronLeft, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfileCompletionPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    nationality: '',
    residence: '',
    phone_no: '',
    city: '',
    country: '',
    facebook: '',
    instagram: '',
    git_hub: '',
    linkedin: '',
    whatsapp: '',
    telegram: '',
    profile_picture: null,
    bio: '',
    account_type: 'traveller',
  });
  const [profilePreview, setProfilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getProfile()
      .then(response => {
        const data = response.data;
        setFormData(prevData => ({ ...prevData, ...data }));
        if (data.profile_picture) {
          setProfilePreview(data.profile_picture);
        }
      })
      .catch(err => {
        console.error('Error fetching profile data:', err.response ? err.response.data : err.message);
        toast.error("Could not load profile data", {
          description: "Please try again later."
        });
      });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'profile_picture') {
        if (formData[key] instanceof File) {
          dataToSend.append(key, formData[key]);
        }
      } else if (formData[key] !== null && formData[key] !== undefined) {
        dataToSend.append(key, formData[key]);
      }
    });

    try {
      const response = await updateProfile(dataToSend);
      console.log('Profile updated successfully:', response.data);
      toast.success("Profile Updated", {
        description: "Your profile has been updated successfully!"
      });
      // Redirect to app after a short delay to show success message
      setTimeout(() => {
        navigate('/app');
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err.response ? err.response.data : err.message);
      toast.error("Update Failed", {
        description: err.response ? JSON.stringify(err.response.data) : 'An error occurred while updating your profile.'
      });
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profile_picture: file });
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-2xl text-center">Choose Your Account Type</CardTitle>
              <CardDescription className="text-center">How do you want to use Linkler?</CardDescription>
            </CardHeader>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={formData.account_type === 'traveller' ? 'default' : 'outline'}
                className="h-32 text-lg font-semibold flex flex-col items-center justify-center gap-3 border-2 transition-all hover:border-primary/50"
                onClick={() => {
                  setFormData({ ...formData, account_type: 'traveller' });
                  setStep(2);
                }}
              >
                <div className={`p-4 rounded-full ${formData.account_type === 'traveller' ? 'bg-primary-foreground/20' : 'bg-primary/5'}`}>
                   <User className="h-8 w-8" />
                </div>
                Traveller
              </Button>
              <Button
                type="button"
                variant={formData.account_type === 'guide' ? 'default' : 'outline'}
                className="h-32 text-lg font-semibold flex flex-col items-center justify-center gap-3 border-2 transition-all hover:border-primary/50"
                onClick={() => {
                  setFormData({ ...formData, account_type: 'guide' });
                  setStep(2);
                }}
              >
                <div className={`p-4 rounded-full ${formData.account_type === 'guide' ? 'bg-primary-foreground/20' : 'bg-primary/5'}`}>
                   <Camera className="h-8 w-8" />
                </div>
                Guide
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-2xl text-center">Profile Picture</CardTitle>
              <CardDescription className="text-center">Add a photo so people recognize you.</CardDescription>
            </CardHeader>
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                  <AvatarImage src={profilePreview} className="object-cover" />
                  <AvatarFallback className="bg-primary/5">
                    <User className="h-16 w-16 text-primary/20" />
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="profile-pic" 
                  className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform"
                >
                  <Upload className="h-5 w-5" />
                  <input id="profile-pic" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">Click the upload icon to select an image</p>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-2xl text-center">Basic Info</CardTitle>
              <CardDescription className="text-center">Tell us a little bit about yourself.</CardDescription>
            </CardHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" name="age" type="number" placeholder="e.g. 25" value={formData.age || ''} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input id="nationality" name="nationality" type="text" placeholder="e.g. American" value={formData.nationality || ''} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="residence">Current Residence</Label>
                <Input id="residence" name="residence" type="text" placeholder="e.g. New York, USA" value={formData.residence || ''} onChange={handleChange} />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-2xl text-center">Contact Info</CardTitle>
              <CardDescription className="text-center">How can people reach you?</CardDescription>
            </CardHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone_no">Phone Number</Label>
                <Input id="phone_no" name="phone_no" type="tel" placeholder="+1 234 567 8900" value={formData.phone_no || ''} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" type="text" placeholder="London" value={formData.city || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" type="text" placeholder="UK" value={formData.country || ''} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-2xl text-center">Social Media</CardTitle>
              <CardDescription className="text-center">Link your external profiles.</CardDescription>
            </CardHeader>
            <div className="space-y-4 max-h-[40vh] overflow-y-auto px-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook URL</Label>
                  <Input id="facebook" name="facebook" type="url" placeholder="https://facebook.com/..." value={formData.facebook || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram URL</Label>
                  <Input id="instagram" name="instagram" type="url" placeholder="https://instagram.com/..." value={formData.instagram || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="git_hub">GitHub URL</Label>
                  <Input id="git_hub" name="git_hub" type="url" placeholder="https://github.com/..." value={formData.git_hub || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input id="linkedin" name="linkedin" type="url" placeholder="https://linkedin.com/in/..." value={formData.linkedin || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input id="whatsapp" name="whatsapp" type="tel" placeholder="+1234567890" value={formData.whatsapp || ''} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegram">Telegram</Label>
                  <Input id="telegram" name="telegram" type="text" placeholder="@username" value={formData.telegram || ''} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-2xl text-center">Bio</CardTitle>
              <CardDescription className="text-center">Write a short introduction.</CardDescription>
            </CardHeader>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="bio">Your Bio</Label>
                    <Textarea 
                      id="bio" 
                      name="bio" 
                      placeholder="Write something about yourself... (max 80 characters)" 
                      value={formData.bio || ''} 
                      onChange={handleChange} 
                      maxLength={80} 
                      className="resize-none h-32"
                    />
                    <p className="text-xs text-muted-foreground text-right mt-1">
                      {formData.bio ? formData.bio.length : 0} / 80
                    </p>
                </div>
            </div>
          </div>
        )
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-linkler-bg)] p-4">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-md shadow-xl border-border/50">
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6">
            {renderStep()}
          </CardContent>

          <CardFooter className="flex justify-between space-x-4 bg-muted/50 p-6 rounded-b-[var(--radius)]">
            {step > 1 ? (
              <Button type="button" variant="ghost" onClick={() => setStep(step - 1)} className="w-full sm:w-auto min-w-[120px]">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            ) : (
              <div aria-hidden="true" className="w-full sm:w-auto min-w-[120px]"></div>
            )}
            
            {step < 6 ? (
              <Button type="button" onClick={() => setStep(step + 1)} className="w-full sm:w-auto min-w-[120px]">
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto min-w-[120px] font-bold">
                {isSubmitting ? 'Saving...' : 'Complete Profile'}
                {!isSubmitting && <Check className="ml-2 h-4 w-4" />}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ProfileCompletionPage;
