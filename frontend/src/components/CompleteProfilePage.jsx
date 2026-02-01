import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import getCookie from '../utils/getCookie';

const CompleteProfilePage = () => {
  const [accountType, setAccountType] = useState(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    username: '',
    nationality: '',
    residence: '',
    facebook: '',
    instagram: '',
    git_hub: '',
    linkedin: '',
    phone_no: '',
    city: '',
    country: '',
    whatsapp: '',
    telegram: '',
  });
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;

  useEffect(() => {
    // if (!userId) {
    //   navigate('/signup'); // Redirect if no user ID is found
    // }
  }, [userId, navigate]);

  const handleAccountTypeSelect = (type) => {
    setAccountType(type);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    // const csrftoken = getCookie('csrftoken');
    // try {
    //   const response = await axios.patch(`/users/${userId}/`, {
    //     ...formData,
    //     account_type: accountType,
    //   }, {
    //     headers: {
    //       'X-CSRFToken': csrftoken,
    //     },
    //   });
    //   console.log('Profile updated successfully:', response.data);
    //   navigate('/login'); // Or to the user's dashboard
    // } catch (error) {
    //   console.error('Error updating profile:', error);
    // }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linkler-bg">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-3xl font-bold text-center text-indigo-600">
          linkler
        </div>
        {!accountType ? (
          <div className="flex justify-around">
            <button
              onClick={() => handleAccountTypeSelect('traveller')}
              className="px-4 py-2 font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              Traveller
            </button>
            <button
              onClick={() => handleAccountTypeSelect('guide')}
              className="px-4 py-2 font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              Guide
            </button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {step === 1 && (
              <>
                <h2 className="text-2xl font-bold text-center text-gray-900">
                  Step 1: Basic Info
                </h2>
                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <label htmlFor="username" className="sr-only">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="age" className="sr-only">
                      Age
                    </label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      required
                      className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Age"
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="nationality" className="sr-only">
                      Nationality
                    </label>
                    <input
                      id="nationality"
                      name="nationality"
                      type="text"
                      required
                      className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="residence" className="sr-only">
                      Residence
                    </label>
                    <input
                      id="residence"
                      name="residence"
                      type="text"
                      required
                      className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Residence"
                      value={formData.residence}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="text-2xl font-bold text-center text-gray-900">
                  Step 2: Contact Info
                </h2>
                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <label htmlFor="phone_no" className="sr-only">
                      phone_no
                    </label>
                    <input
                      id="phone_no"
                      name="phone_no"
                      type="text"
                      className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="phone_no"
                      value={formData.phone_no}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="sr-only">
                      city
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="sr-only">
                      country
                    </label>
                    <input
                      id="country"
                      name="country"
                      type="text"
                      className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="country"
                      value={formData.country}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <h2 className="text-2xl font-bold text-center text-gray-900">
                  Step 3: Social Media
                </h2>
                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <label htmlFor="facebook" className="sr-only">
                      Facebook
                    </label>
                    <input
                      id="facebook"
                      name="facebook"
                      type="text"
                      className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Facebook profile URL"
                      value={formData.facebook}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="instagram" className="sr-only">
                      Instagram
                    </label>
                    <input
                      id="instagram"
                      name="instagram"
                      type="text"
                      className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Instagram profile URL"
                      value={formData.instagram}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="git_hub" className="sr-only">
                      GitHub
                    </label>
                    <input
                      id="git_hub"
                      name="git_hub"
                      type="text"
                      className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="GitHub profile URL"
                      value={formData.git_hub}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="linkedin" className="sr-only">
                      LinkedIn
                    </label>
                    <input
                      id="linkedin"
                      name="linkedin"
                      type="text"
                      className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="LinkedIn profile URL"
                      value={formData.linkedin}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="whatsapp" className="sr-only">
                      whatsapp
                    </label>
                    <input
                      id="whatsapp"
                      name="whatsapp"
                      type="text"
                      className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="telegram" className="sr-only">
                      telegram
                    </label>
                    <input
                      id="telegram"
                      name="telegram"
                      type="text"
                      className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="telegram"
                      value={formData.telegram}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-between space-x-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md group hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Complete Profile
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CompleteProfilePage;
