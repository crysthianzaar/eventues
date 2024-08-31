import React, { useEffect } from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { I18n } from '@aws-amplify/core';
import { useNavigate } from 'react-router-dom';
import '@aws-amplify/ui-react/styles.css';

I18n.putVocabularies({
  'pt-BR': {
    'Sign in': 'Entrar',
    'Sign In with Google': 'Entrar com o Google',
    'Sign Up with Google': 'Cadastrar com o Google',
    'Sign Up': 'Registrar-se',
    'Sign Out': 'Sair',
    'Username': 'Nome de usuário',
    'Password': 'Senha',
    'Enter your username': 'Digite seu nome de usuário',
    'Enter your password': 'Digite sua senha',
    'Forgot your password?': 'Esqueceu sua senha?',
    'Reset your password': 'Redefinir sua senha',
    'Back to Sign In': 'Voltar para Entrar',
    'No account?': 'Não tem conta?',
    'Create Account': 'Criar Conta',
    'Resend Code': 'Reenviar código',
    'Confirm': 'Confirmar',
    'Confirm Password': 'Confirmar Senha',
    'Please confirm your Password': 'Confirme a sua Senha',
    'Confirmation Code': 'Código de Confirmação',
    'New Password': 'Nova Senha',
    'Create a new account': 'Criar uma nova conta',
    'Enter your Email': 'Digite seu endereço de email',
    'Enter your Password': 'Digite a sua senha',
    'Verification code': 'Código de verificação',
    'Code': 'Código',
    'Enter your confirmation code': 'Digite seu código de confirmação',
    'Reset Password': 'Redefinir Senha',
    'Submit': 'Enviar',
    'Enter your code': 'Digite seu código',
    'Resend code': 'Reenviar código',
    'Reset code': 'Código de Redefinição',
  }
});

// Definindo o idioma padrão para português
I18n.setLanguage('pt-BR');

const MyAuthenticator: React.FC = () => {
  const { user } = useAuthenticator();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5',
    }}>
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

export default MyAuthenticator;
