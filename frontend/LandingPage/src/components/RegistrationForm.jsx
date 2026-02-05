import React, { useState } from 'react';
import axios from 'axios';

function RegistrationForm() { // Renamed from GuideRegistrationForm
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nationality, setNationality] = useState(''); // New field for nationality
  const [message, setMessage] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState(null); // 'success', 'error', 'submitting'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionStatus('submitting');
    try {
      await axios.post('/api/register/', { // New API endpoint, more generic
        name,
        email,
        nationality, // Include nationality
        message,
      });
      setSubmissionStatus('success');
      setName('');
      setEmail('');
      setNationality('');
      setMessage('');
    } catch (error) {
      console.error('Error submitting registration:', error);
      if (error.response && error.response.data && error.response.data.email) {
        setSubmissionStatus('error: ' + error.response.data.email); // Display specific email error
      } else {
        setSubmissionStatus('error: Something went wrong.');
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-linkler-bg p-4"> {/* Centering container */}
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md"> {/* Form container */}
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2> {/* Generic title */}
        <p className="text-gray-600 mb-6 text-center">Join us as a Traveller or a Guide!</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">Nationality</label> {/* New nationality field */}
            <input
              type="text"
              id="nationality"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message (Optional)</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submissionStatus === 'submitting'}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {submissionStatus === 'submitting' ? 'Submitting...' : 'Register'}
          </button>

          {submissionStatus === 'success' && (
            <p className="mt-3 text-sm text-green-600 text-center">Thank you for your interest! We'll be in touch.</p>
          )}
          {submissionStatus && submissionStatus.startsWith('error') && (
            <p className="mt-3 text-sm text-red-600 text-center">Error: {submissionStatus.substring(7)}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default RegistrationForm;
