import React, { useState, useEffect, useRef } from 'react';
import { getProfile, updateProfile, changePassword } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SettingsPage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    phone_no: '',
    city: '',
    country: '',
    nationality: '',
    opt_out_discovery: false,
    show_followers_list: true,
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [chatViewPreference, setChatViewPreference] = useState(localStorage.getItem('chatViewPreference') || 'small');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChatViewChange = (val) => {
    setChatViewPreference(val);
    localStorage.setItem('chatViewPreference', val);
    setMessage({ type: 'success', text: 'Chat preference updated!' });
  };
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        bio: user.bio || '',
        phone_no: user.phone_no || '',
        city: user.city || '',
        country: user.country || '',
        nationality: user.nationality || '',
        opt_out_discovery: user.opt_out_discovery || false,
        show_followers_list: user.show_followers_list ?? true,
      });
      setPreviewImage(user.profile_picture || null);
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let dataToSend = new FormData();
      dataToSend.append('username', profileData.username);
      dataToSend.append('bio', profileData.bio);
      dataToSend.append('phone_no', profileData.phone_no);
      dataToSend.append('city', profileData.city);
      dataToSend.append('country', profileData.country);
      dataToSend.append('nationality', profileData.nationality);
      dataToSend.append('opt_out_discovery', profileData.opt_out_discovery);
      dataToSend.append('show_followers_list', profileData.show_followers_list);
      
      if (profileImage) {
        dataToSend.append('profile_picture', profileImage);
      }

      const res = await updateProfile(dataToSend);
      // Update local AuthContext user state
      setUser(res.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setProfileImage(null); // Clear pending upload
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await changePassword(passwordData.oldPassword, passwordData.newPassword);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.old_password?.[0] || 'Failed to change password.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-ui-bg-alt transition text-ui-muted"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-3xl font-bold text-ui-text-main">Settings</h1>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 rounded-xl font-medium ${message.type === 'success' ? 'bg-success-light text-success-hover border border-success/20' : 'bg-error-light text-error-hover border border-error/20'}`}>
          {message.text}
        </div>
      )}

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px] mb-8">
          <TabsTrigger value="account">Profile Details</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Update your public profile and business information.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitProfileUpdate} className="space-y-6 mt-4">
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-ui-white shadow-md">
                      <AvatarImage src={previewImage} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-tr from-brand-light to-brand/20 text-brand font-bold text-3xl">
                        {user?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      type="button"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full shadow-lg border-2 border-background"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </Button>
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef} 
                      onChange={handleImageChange} 
                      className="hidden" 
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground leading-tight">Profile Picture</h3>
                    <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, or GIF. Max 5MB.</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input
                      name="username"
                      value={profileData.username}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        name="city"
                        value={profileData.city}
                        onChange={handleProfileChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Input
                        name="country"
                        value={profileData.country}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        name="phone_no"
                        value={profileData.phone_no}
                        onChange={handleProfileChange}
                        placeholder="+1 234 567 890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nationality</Label>
                      <Input
                        name="nationality"
                        value={profileData.nationality}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Bio / Business Description</Label>
                    <textarea
                      name="bio"
                      rows="4"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      placeholder="Tell other travelers about yourself or your business..."
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Discovery & Privacy</CardTitle>
              <CardDescription>Control how you appear to other travelers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border bg-ui-white">
                  <div>
                    <p className="font-bold text-sm text-ui-text-main">Opt-out of Discovery</p>
                    <p className="text-xs text-ui-muted">Hide your profile from search results and discovery algorithms.</p>
                  </div>
                  <button 
                    onClick={() => setProfileData({ ...profileData, opt_out_discovery: !profileData.opt_out_discovery })}
                    className={`w-12 h-6 rounded-full transition-all relative ${profileData.opt_out_discovery ? 'bg-brand' : 'bg-ui-muted/30'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${profileData.opt_out_discovery ? 'left-7' : 'left-1'}`} />
                  </button>
               </div>

               <div className="flex items-center justify-between p-4 rounded-xl border-2 border-border bg-ui-white">
                  <div>
                    <p className="font-bold text-sm text-ui-text-main">Show Followers List</p>
                    <p className="text-xs text-ui-muted">Allow others to see who you follow and who follows you.</p>
                  </div>
                  <button 
                    onClick={() => setProfileData({ ...profileData, show_followers_list: !profileData.show_followers_list })}
                    className={`w-12 h-6 rounded-full transition-all relative ${profileData.show_followers_list ? 'bg-brand' : 'bg-ui-muted/30'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${profileData.show_followers_list ? 'left-7' : 'left-1'}`} />
                  </button>
               </div>
               
               <div className="flex justify-end pt-2 border-t border-border mt-6">
                  <Button onClick={submitProfileUpdate} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </Button>
               </div>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Chat Preferences</CardTitle>
              <CardDescription>Choose how chats open by default on larger screens.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4">
                <div 
                  onClick={() => handleChatViewChange('small')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${chatViewPreference === 'small' ? 'border-brand bg-brand/5' : 'border-border hover:border-ui-muted'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-ui-bg-alt flex items-center justify-center text-ui-text-secondary">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <p className="font-bold text-sm">Small Floating Window</p>
                      <p className="text-xs text-ui-muted">Multi-task while you chat (Desktop only)</p>
                    </div>
                  </div>
                  {chatViewPreference === 'small' && <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>}
                </div>

                <div 
                  onClick={() => handleChatViewChange('large')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${chatViewPreference === 'large' ? 'border-brand bg-brand/5' : 'border-border hover:border-ui-muted'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-ui-bg-alt flex items-center justify-center text-ui-text-secondary">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    </div>
                    <div>
                      <p className="font-bold text-sm">Full Messaging Pane</p>
                      <p className="text-xs text-ui-muted">Focus on the conversation</p>
                    </div>
                  </div>
                  {chatViewPreference === 'large' && <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your password to secure your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitPasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input
                    type="password"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div className="space-y-2 pt-2">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="pt-4 mt-4 border-t border-border">
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={loading}
                    className="w-full"
                  >
                    Change Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
