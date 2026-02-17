import React, { useState } from 'react';
import { register } from '../services/api';
// import { useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password1: '',
    password2: '',
    username: '',
  });
  const [error, setError] = useState(null);
  // const navigate = useNavigate(); // useNavigate can only be used in the context of a <Router> component.

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password1 !== formData.password2) {
      setError("Passwords do not match.");
      return;
    }

    console.log('Sign up form submitted');

    const { email, username, password1, password2 } = formData;
    const finalFormData = { email, username, password1, password2 };

    try {
      const response = await register(finalFormData);
      console.log('User registered successfully:', response.data);
      alert('Registration successful! Please check your email to verify your account.');
      // navigate('/login'); 
    } catch (err) {
      console.error('Error during registration:', err.response ? err.response.data : err.message);
      setError(err.response ? JSON.stringify(err.response.data) : err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-linkler-bg)]">
      <div className="flex w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        {/* Left Column */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-[#3b82f6] text-white p-12 rounded-l-lg">
          <h1 className="text-4xl font-bold mb-4">Welcome to Linkler</h1>
          <p className="text-center">Connect with travelers and guides from around the world. Share your journey and discover new places.</p>
        </div>

        {/* Right Column */}
        <div className="w-full md:w-1/2 p-8">
          <div className="text-3xl font-bold text-center text-[#3b82f6] mb-8">
            linkler
          </div>
          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-center text-gray-900">Create Your Account</h2>
            <div className="rounded-md shadow-sm mt-6 space-y-4">
              <input name="email" type="email" required className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Email address" value={formData.email} onChange={handleChange} />
              <input name="username" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Username" value={formData.username} onChange={handleChange} />
              <input name="password1" type="password" required className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Password" value={formData.password1} onChange={handleChange} />
              <input name="password2" type="password" required className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Confirm Password" value={formData.password2} onChange={handleChange} />
            </div>
            <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-[#3b82f6] border border-transparent rounded-md hover:bg-blue-700">
              Sign Up
            </button>
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

export default SignUpPage;
