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
    setAuthError(null); // Clear previous errors
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/callback');
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle specific Firebase error codes
      if (err.code === 'auth/user-not-found') {
        setAuthError('E-mail não encontrado. Verifique seu e-mail ou crie uma conta.');
      } else if (err.code === 'auth/wrong-password') {
        setAuthError('Senha incorreta. Tente novamente.');
      } else if (err.code === 'auth/invalid-email') {
        setAuthError('Por favor, insira um e-mail válido.');
      } else if (err.code === 'auth/too-many-requests') {
        setAuthError('Muitas tentativas de login. Tente novamente mais tarde.');
      } else {
        setAuthError('Falha ao tentar fazer login. Verifique suas credenciais.');
      }
    } finally {
      setSigningIn(false);
    }
  };

  const signUpWithEmail = async () => {
    setSigningIn(true);
    setAuthError(null); // Clear previous errors
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSignupSuccess(true);
      setTimeout(() => router.push('/callback'), 3000);
    } catch (err: any) {
      console.error('Signup error:', err);
      console.error('Error code:', err.code);
      
      // Handle specific Firebase error codes
      let errorMessage = '';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Por favor, insira um e-mail válido.';
      } else {
        errorMessage = 'Falha ao tentar criar conta. Tente novamente.';
      }
      
      console.log('Setting auth error:', errorMessage);
      setAuthError(errorMessage);
      
      // Force a small delay to ensure state update
      setTimeout(() => {
        console.log('Auth error after timeout:', errorMessage);
      }, 100);
    } finally {
      setSigningIn(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setAuthError('Por favor, insira seu e-mail para redefinir a senha.');
      return;
    }
    setAuthError(null); // Clear previous errors
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      
      if (err.code === 'auth/user-not-found') {
        setAuthError('E-mail não encontrado. Verifique se o e-mail está correto.');
      } else if (err.code === 'auth/invalid-email') {
        setAuthError('Por favor, insira um e-mail válido.');
      } else {
        setAuthError('Erro ao enviar e-mail de redefinição de senha.');
      }
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
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
    clearAuthError,
  };
};

export default useAuth;
