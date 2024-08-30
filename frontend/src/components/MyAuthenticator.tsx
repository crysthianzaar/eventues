import React, { ReactNode } from 'react';
import {
  Authenticator,
  useAuthenticator,
  View,
  Image,
  Text,
  Button,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import logo from '../assets/logo.png';

interface MyAuthenticatorProps {
  children: ReactNode;
}

const MySignIn = () => {
  const { signOut, user } = useAuthenticator();

  return (
    <View>
      <Image src={logo} alt="Logo" />
      <Text>Welcome back, {user?.username}</Text>
      <Button onClick={signOut}>Sign Out</Button>
    </View>
  );
};

const MyAuthenticator: React.FC<MyAuthenticatorProps> = ({ children }) => (
  <Authenticator>
    {({ signOut, user }) => (
      <View>
        <MySignIn />
        {children}
      </View>
    )}
  </Authenticator>
);

export default MyAuthenticator;
