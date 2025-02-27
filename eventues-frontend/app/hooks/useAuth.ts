// hooks/useAuth.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../../firebase';

const useAuth = () => {
  const router = useRouter();
  const provider = new GoogleAuthProvider();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const signInWithGoogle = async () => {
    setSigningIn(true);
    try {
      await signInWithPopup(auth, provider);
      router.push('/callback');
    } catch (err) {
      setAuthError('Falha ao tentar fazer login com Google.');
    } finally {
      setSigningIn(false);
    }
  };

  const signInWithEmail = async () => {
    setSigningIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/callback');
    } catch (err) {
      setAuthError('Falha ao tentar fazer login com e-mail e senha.');
    } finally {
      setSigningIn(false);
    }
  };

  const signUpWithEmail = async () => {
    setSigningIn(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSignupSuccess(true);
      setTimeout(() => router.push('/callback'), 3000);
    } catch (err) {
      setAuthError('Falha ao tentar criar conta.');
    } finally {
      setSigningIn(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setAuthError('Por favor, insira seu e-mail para redefinir a senha.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
    } catch (err) {
      setAuthError('Erro ao enviar e-mail de redefinição de senha.');
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    signingIn,
    authError,
    resetEmailSent,
    signupSuccess,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    handlePasswordReset,
  };
};

export default useAuth;
