// pages/callback.tsx
'use client';

import React from 'react';
import useAuthCallback from '../hooks/useAuthCallback';
import LoadingOverlay from '../components/LoadingOverlay';
import AuthErrorMessage from './components/AuthErrorMessage';

const CallbackPage: React.FC = () => {
  const { errorMessage } = useAuthCallback();

  return (
    <div>
      {errorMessage ? <AuthErrorMessage message={errorMessage} /> : <LoadingOverlay />}
    </div>
  );
};

export default CallbackPage;
