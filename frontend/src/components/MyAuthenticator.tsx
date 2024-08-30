import React, { useEffect } from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { I18n } from '@aws-amplify/core';  // Ajuste a importação
import { useNavigate } from 'react-router-dom';
import '@aws-amplify/ui-react/styles.css';

// Definindo as traduções em português
I18n.putVocabularies({
  'pt-BR': {
    'Sign In': 'Entrar',
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
    'Create account': 'Criar conta',
    'Resend Code': 'Reenviar código',
    'Confirm': 'Confirmar',
    'Confirmation Code': 'Código de Confirmação',
    'New Password': 'Nova Senha',
    'Create a new account': 'Criar uma nova conta',
    'Enter your email address': 'Digite seu endereço de email',
    'Enter your phone number': 'Digite seu número de telefone',
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
    <Authenticator socialProviders={['google']} hideSignUp={false}>
      {({ signOut, user }) => (
        <div>
          <p>Bem-vindo de volta, {user?.username}</p>
          <button onClick={signOut}>Sair</button>
        </div>
      )}
    </Authenticator>
  );
};

export default MyAuthenticator;
