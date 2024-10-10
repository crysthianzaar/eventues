// app/login/page.tsx
'use client';

import React, { useEffect } from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { I18n } from '@aws-amplify/core';
import { useRouter, useSearchParams } from 'next/navigation';
import '@aws-amplify/ui-react/styles.css';
import './../configureAmplify'; // Import your Amplify configuration

I18n.putVocabularies({
  'pt-BR': {
    // ... your vocabulary translations
  },
});

I18n.setLanguage('pt-BR');

const LoginPage: React.FC = () => {
  return (
    <Authenticator.Provider>
      <LoginContent />
    </Authenticator.Provider>
  );
};

const LoginContent: React.FC = () => {
  const { user } = useAuthenticator();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';

  useEffect(() => {
    if (user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('from', from);
      }
      router.replace('/callback');
    }
  }, [user, router, from]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Authenticator socialProviders={['google']} hideSignUp={false}>
        {({ signOut, user }) => (
          <div>
            <p>Bem-vindo de volta, {user?.username}</p>
            <button onClick={signOut}>Sair</button>
          </div>
        )}
      </Authenticator>
    </div>
  );
};

export default LoginPage;
