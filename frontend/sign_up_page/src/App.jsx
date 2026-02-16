import React, { useState } from 'react';
import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

const App = () => {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
  });
  const [error, setError] = useState(null);
  // const navigate = useNavigate(); // useNavigate can only be used in the context of a <Router> component.

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAccountTypeSelect = (type) => {
    setAccountType(type);
    setStep(2); // Move to the next step after selecting account type
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    console.log('Sign up form submitted');
    
    const finalFormData = {
      ...formData,
      account_type: accountType,
    };

    try {
      const response = await axios.post('/api/auth/registration/', finalFormData);
      console.log('User registered successfully:', response.data);
      // On success, you might want to redirect the user or clear the form
      // For now, just logging success
      alert('Registration successful! Please login.');
      // navigate('/login'); 
    } catch (err) {
      console.error('Error during registration:', err.response ? err.response.data : err.message);
      setError(err.response ? JSON.stringify(err.response.data) : err.message);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Account Type</h2>
            <div className="flex justify-around">
              <button
                onClick={() => handleAccountTypeSelect('traveller')}
                className="px-6 py-3 font-medium text-white bg-primary border border-transparent rounded-md hover:bg-blue-700"
              >
                Traveller
              </button>
              <button
                onClick={() => handleAccountTypeSelect('guide')}
                className="px-6 py-3 font-medium text-white bg-primary border border-transparent rounded-md hover:bg-blue-700"
              >
                Guide
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-900">Step 1: Account Credentials</h2>
            <div className="rounded-md shadow-sm mt-6 space-y-4">
              <input name="email" type="email" required className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Email address" value={formData.email} onChange={handleChange} />
              <input name="password" type="password" required className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Password" value={formData.password} onChange={handleChange} />
              <input name="username" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Username" value={formData.username} onChange={handleChange} />
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-900">Step 2: Basic Info</h2>
            <div className="rounded-md shadow-sm mt-6 space-y-4">
              <input name="age" type="number" required className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Age" value={formData.age} onChange={handleChange} />
              <input name="nationality" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Nationality" value={formData.nationality} onChange={handleChange} />
              <input name="residence" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Residence" value={formData.residence} onChange={handleChange} />
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-900">Step 3: Contact Info</h2>
            <div className="rounded-md shadow-sm mt-6 space-y-4">
              <input name="phone_no" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Phone Number" value={formData.phone_no} onChange={handleChange} />
              <input name="city" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="City" value={formData.city} onChange={handleChange} />
              <input name="country" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Country" value={formData.country} onChange={handleChange} />
            </div>
          </>
        );
      case 5:
        return (
          <>
            <h2 className="text-2xl font-bold text-center text-gray-900">Step 4: Social Media</h2>
            <div className="rounded-md shadow-sm mt-6 space-y-4">
              <input name="facebook" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Facebook profile URL" value={formData.facebook} onChange={handleChange} />
              <input name="instagram" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Instagram profile URL" value={formData.instagram} onChange={handleChange} />
              <input name="git_hub" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="GitHub profile URL" value={formData.git_hub} onChange={handleChange} />
              <input name="linkedin" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="LinkedIn profile URL" value={formData.linkedin} onChange={handleChange} />
              <input name="whatsapp" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="WhatsApp Number" value={formData.whatsapp} onChange={handleChange} />
              <input name="telegram" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Telegram Username" value={formData.telegram} onChange={handleChange} />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-main">
      <div className="flex w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        {/* Left Column */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-bg-accent text-text-accent p-12 rounded-l-lg">
          <h1 className="text-4xl font-bold mb-4">Welcome to Linkler</h1>
          <p className="text-center">Connect with travelers and guides from around the world. Share your journey and discover new places.</p>
        </div>

        {/* Right Column */}
        <div className="w-full md:w-1/2 p-8">
          <div className="text-3xl font-bold text-center text-primary mb-8">
            linkler
          </div>
          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {renderStep()}
            <div className="flex justify-between space-x-4 mt-6">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)} className="w-full px-4 py-2 text-sm font-medium text-primary bg-white border border-primary rounded-md hover:bg-blue-50">
                  Back
                </button>
              )}
              {step < 5 ? (
                <button type="button" onClick={() => setStep(step + 1)} className="w-full px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-blue-700">
                  Next
                </button>
              ) : (
                <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-blue-700">
                  Sign Up
                </button>
              )}
            </div>
          </form>
          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-500 bg-white">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
                      <a
                        href="http://127.0.0.1:8000/accounts/google/login/?process=login" className="flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
              Sign in with Google
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
