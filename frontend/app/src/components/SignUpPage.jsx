import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import getCookie from '../utils/getCookie';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // const csrftoken = getCookie('csrftoken');
    // try {
    //   const response = await axios.post('/users/', {
    //     ...formData,
    //     username: formData.email,
    //   }, {
    //     headers: {
    //       'X-CSRFToken': csrftoken,
    //     },
    //   });
    //   console.log('User registered successfully:', response.data);
    //   navigate('/complete-profile', { state: { userId: response.data.id } });
    // } catch (error) {
    //   console.error('Error during registration:', error);
    // }
    console.log('Sign up form submitted');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-linkler-bg)]">
      <div className="w-full max-w-md p-8 space-y-8 bg-ui-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-ui-text-main">Sign Up</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full px-3 py-2 text-ui-text-main placeholder-ui-muted border border-ui-border rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-accent-indigo focus:border-accent-indigo focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full px-3 py-2 text-ui-text-main placeholder-ui-muted border border-ui-border rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-accent-indigo focus:border-accent-indigo focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-accent-indigo border border-transparent rounded-md group hover:bg-accent-indigo/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-indigo"
            >
              Sign Up
            </button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ui-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-ui-muted bg-ui-white">Or continue with</span>
          </div>
        </div>

        <div>
          <a
            href="http://127.0.0.1:8000/accounts/google/login/?process=login"
            className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-ui-text-secondary bg-ui-white border border-ui-border rounded-md shadow-sm group hover:bg-ui-bg-alt focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-indigo"
          >
            Sign in with Google
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
