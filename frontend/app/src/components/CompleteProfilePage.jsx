import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../services/api';
import { useNavigate } from 'react-router-dom';

const CompleteProfilePage = () => {
  const [formData, setFormData] = useState({
    username: '',
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
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve token
        const headers = token ? { Authorization: `Token ${token}` } : {};

        const response = await apiClient.get('/api/auth/user/', { headers });
        const userData = response.data;
        setFormData({
          username: userData.username || '',
          age: userData.age || '',
          nationality: userData.nationality || '',
          residence: userData.residence || '',
          phone_no: userData.phone_no || '',
          city: userData.city || '',
          country: userData.country || '',
          facebook: userData.facebook || '',
          instagram: userData.instagram || '',
          git_hub: userData.git_hub || '',
          linkedin: userData.linkedin || '',
          whatsapp: userData.whatsapp || '',
          telegram: userData.telegram || '',
          bio: userData.bio || '',
        });
        if (userData.profile_picture) {
          setProfilePicturePreview(userData.profile_picture);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Could not load your profile data. Please try again later.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePicture(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const data = new FormData();
    // Only append fields that have been changed or are new
    for (const key in formData) {
      if (formData[key]) { // Check if the field is not empty
        data.append(key, formData[key]);
      }
    }
    if (profilePicture) {
      data.append('profile_picture', profilePicture);
    }

    try {
      const token = localStorage.getItem('token'); // Retrieve token
      const headers = token ? { Authorization: `Token ${token}`, 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'multipart/form-data' };

      await apiClient.patch('/api/auth/user/', data, { headers });
      navigate('/'); // Redirect to the main app on success
    } catch (err) {
      console.error('Error updating profile:', err.response ? err.response.data : err.message);
      setError('Failed to update profile. Please check your inputs.');
    }
  };
  
  const handleSkip = () => {
    navigate('/'); // Redirect to the main app
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Complete Your Profile</h1>
          <p className="mt-2 text-gray-600">Add a few more details to get the most out of Linkler.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <img 
              src={profilePicturePreview || 'https://via.placeholder.com/150'} 
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover"
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current.click()}
              className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50"
            >
              Change Picture
            </button>
          </div>

          {/* Bio Section */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              id="bio"
              name="bio"
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="Tell us a little about yourself"
              value={formData.bio}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* All other fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input name="username" type="text" required placeholder="Username" value={formData.username} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            <input name="age" type="number" placeholder="Age" value={formData.age} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            <input name="nationality" type="text" placeholder="Nationality" value={formData.nationality} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            <input name="residence" type="text" placeholder="Residence" value={formData.residence} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            <input name="phone_no" type="text" placeholder="Phone Number" value={formData.phone_no} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            <input name="city" type="text" placeholder="City" value={formData.city} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            <input name="country" type="text" placeholder="Country" value={formData.country} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            <input name="whatsapp" type="text" placeholder="WhatsApp" value={formData.whatsapp} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            <input name="telegram" type="text" placeholder="Telegram" value={formData.telegram} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            <input name="facebook" type="url" placeholder="Facebook URL" value={formData.facebook} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            <input name="instagram" type="url" placeholder="Instagram URL" value={formData.instagram} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            <input name="git_hub" type="url" placeholder="GitHub URL" value={formData.git_hub} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            <input name="linkedin" type="url" placeholder="LinkedIn URL" value={formData.linkedin} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>

          <div className="flex justify-between space-x-4 pt-4">
            <button
              type="button"
              onClick={handleSkip}
              className="w-1/2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Skip for now
            </button>
            <button
              type="submit"
              className="w-1/2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
