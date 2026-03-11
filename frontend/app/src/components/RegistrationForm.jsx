import React, { useState } from 'react';
import apiClient from '../services/api';

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
      await apiClient.post('/api/register/', { // New API endpoint, more generic
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
    <div className="flex justify-center items-center min-h-screen bg-[var(--color-linkler-bg)] p-4"> {/* Centering container */}
      <div className="max-w-md w-full p-6 bg-ui-white rounded-lg shadow-md"> {/* Form container */}
        <h2 className="text-2xl font-bold mb-4 text-center text-ui-text-main">Register</h2> {/* Generic title */}
        <p className="text-ui-text-secondary mb-6 text-center">Join us as a Traveller or a Guide!</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-ui-text-secondary">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-ui-border rounded-md shadow-sm focus:outline-none focus:ring-accent-indigo focus:border-accent-indigo sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ui-text-secondary">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-ui-border rounded-md shadow-sm focus:outline-none focus:ring-accent-indigo focus:border-accent-indigo sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="nationality" className="block text-sm font-medium text-ui-text-secondary">Nationality</label> {/* New nationality field */}
            <input
              type="text"
              id="nationality"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-ui-border rounded-md shadow-sm focus:outline-none focus:ring-accent-indigo focus:border-accent-indigo sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-ui-text-secondary">Message (Optional)</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-ui-border rounded-md shadow-sm focus:outline-none focus:ring-accent-indigo focus:border-accent-indigo sm:text-sm"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submissionStatus === 'submitting'}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-indigo hover:bg-accent-indigo/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-indigo disabled:opacity-50"
          >
            {submissionStatus === 'submitting' ? 'Submitting...' : 'Register'}
          </button>

          {submissionStatus === 'success' && (
            <p className="mt-3 text-sm text-success text-center">Thank you for your interest! We'll be in touch.</p>
          )}
          {submissionStatus && submissionStatus.startsWith('error') && (
            <p className="mt-3 text-sm text-error text-center">Error: {submissionStatus.substring(7)}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default RegistrationForm;
