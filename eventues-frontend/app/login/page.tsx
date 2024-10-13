// app/login/page.tsx
'use client'; // Indica que este é um componente de cliente

import type { NextPage } from "next";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import { auth } from "../../firebase"; // Ajuste o caminho conforme sua estrutura de pastas
import { useRouter } from "next/navigation";

const Home: NextPage = () => {
  const provider = new GoogleAuthProvider();
  const [user, loading, error] = useAuthState(auth);
  const [signingIn, setSigningIn] = useState(false);
  const router = useRouter(); // Inicializa o useRouter

  const signIn = async () => {
    setSigningIn(true);
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Usuário logado:", result.user);
      router.push("/"); // Redireciona para a página desejada após login
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      alert("Falha ao tentar fazer login. Por favor, tente novamente.");
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Erro ao carregar autenticação: {error.message}</div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-xl">Bem-vindo, {user.displayName}!</div>
        <button
          onClick={() => auth.signOut()}
          className="mt-4 bg-red-600 text-white rounded-md p-2 w-48 hover:bg-red-700 transition-colors"
        >
          Sair
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="mb-4 text-lg">Por favor, faça login para continuar</div>
      <button
        onClick={signIn}
        disabled={signingIn}
        className={`flex items-center justify-center bg-blue-600 text-white rounded-md p-2 w-48 hover:bg-blue-700 transition-colors ${
          signingIn ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {signingIn ? "Entrando..." : "Entrar com Google"}
      </button>
    </div>
  );
};

export default Home;
