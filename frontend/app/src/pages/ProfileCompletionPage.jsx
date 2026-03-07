import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/api';
import { useNavigate } from 'react-router-dom';

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
    bio: '',
    account_type: 'traveller',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getProfile()
      .then(response => {
        setFormData(prevData => ({ ...prevData, ...response.data }));
      })
      .catch(err => {
        console.error('Error fetching profile data:', err.response ? err.response.data : err.message);
        setError('Could not load profile data. Please try again later.');
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
    setError(null);
    setSuccess(null);

    try {
      const response = await updateProfile(formData);
      console.log('Profile updated successfully:', response.data);
      setSuccess('Your profile has been updated successfully!');
      // Redirect to app after a short delay to show success message
      setTimeout(() => {
        navigate('/app');
      }, 1500);
    } catch (err) {
      console.error('Error updating profile:', err.response ? err.response.data : err.message);
      setError(err.response ? JSON.stringify(err.response.data) : 'An error occurred while updating your profile.');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-900">Choose Your Account Type</h2>
            <div className="flex justify-around mt-6">
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, account_type: 'traveller' });
                  setStep(2);
                }}
                className={`px-6 py-3 font-medium text-white border border-transparent rounded-md ${formData.account_type === 'traveller' ? 'bg-[#3b82f6]' : 'bg-[#3b82f6]/90 hover:bg-[#3b82f6]'}`}
              >
                Traveller
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, account_type: 'guide' });
                  setStep(2);
                }}
                className={`px-6 py-3 font-medium text-white border border-transparent rounded-md ${formData.account_type === 'guide' ? 'bg-[#3b82f6]' : 'bg-[#3b82f6]/90 hover:bg-[#3b82f6]'}`}
              >
                Guide
              </button>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-900">Basic Info</h2>
            <div className="rounded-md shadow-sm mt-6 space-y-4">
              <input name="age" type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Age" value={formData.age || ''} onChange={handleChange} />
              <input name="nationality" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Nationality" value={formData.nationality || ''} onChange={handleChange} />
              <input name="residence" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Residence" value={formData.residence || ''} onChange={handleChange} />
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-900">Contact Info</h2>
            <div className="rounded-md shadow-sm mt-6 space-y-4">
              <input name="phone_no" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Phone Number" value={formData.phone_no || ''} onChange={handleChange} />
              <input name="city" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="City" value={formData.city || ''} onChange={handleChange} />
              <input name="country" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Country" value={formData.country || ''} onChange={handleChange} />
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-900">Social Media</h2>
            <div className="rounded-md shadow-sm mt-6 space-y-4">
              <input name="facebook" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Facebook profile URL" value={formData.facebook || ''} onChange={handleChange} />
              <input name="instagram" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Instagram profile URL" value={formData.instagram || ''} onChange={handleChange} />
              <input name="git_hub" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="GitHub profile URL" value={formData.git_hub || ''} onChange={handleChange} />
              <input name="linkedin" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="LinkedIn profile URL" value={formData.linkedin || ''} onChange={handleChange} />
              <input name="whatsapp" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="WhatsApp Number" value={formData.whatsapp || ''} onChange={handleChange} />
              <input name="telegram" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Telegram Username" value={formData.telegram || ''} onChange={handleChange} />
            </div>
          </>
        );
      case 5:
        return (
            <>
                <h2 className="text-2xl font-bold text-center text-gray-900">Bio</h2>
                <div className="rounded-md shadow-sm mt-6 space-y-4">
                    <textarea name="bio" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Bio (max 80 characters)" value={formData.bio || ''} onChange={handleChange} maxLength="80" />
                </div>
            </>
        )
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md">
        
        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        {success && (
          <div className="p-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
            <span className="font-medium">Success:</span> {success}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {renderStep()}

          <div className="flex justify-between space-x-4 mt-6">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                Back
              </button>
            )}
            {step < 5 ? (
              <button type="button" onClick={() => setStep(step + 1)} className="w-full px-4 py-2 text-sm font-medium text-white bg-[#3b82f6] border border-transparent rounded-md hover:bg-[#3b82f6]/90">
                Next
              </button>
            ) : (
              <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
                Save Changes
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletionPage;
