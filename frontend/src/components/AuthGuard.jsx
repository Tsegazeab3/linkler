import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthGuard = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to signin but save the attempted location
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // 1. Mandatory Onboarding Questionnaire (for everyone)
  if (user && !user.onboarding_completed) {
     if (location.pathname !== '/app/onboarding') {
        return <Navigate to="/app/onboarding" replace />;
     }
     return children; 
  }

  // 2. Mandatory Verification for Guides/Services
  // If they are a guide and are still 'pending' but finished onboarding, 
  // we check if they are already on the verify page.
  if (user && (user.account_type === 'guide' || user.account_type === 'service') && 
      user.verification_status === 'pending') {
      
      // We need a way to know if they've uploaded docs. 
      // For now, let's just allow them to use the app but nudge them, 
      // OR force them if they try to access provider features.
      
      // If you want it mandatory for them to see the verify page first:
      /*
      if (location.pathname !== '/app/verify') {
          return <Navigate to="/app/verify" replace />;
      }
      */
  }

  return children;
};

export default AuthGuard;
