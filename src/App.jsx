import "./App.css";

import Header from "./components/Header";

import { Outlet } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./index.css";

function App() {
  // Pegamos a string do localStorage
  const authString = localStorage.getItem("auth");

  // Convertemos de volta para objeto se ela existir
  const authData = authString ? JSON.parse(authString) : null;

  // Verificamos se existe o objeto e a propriedade 'user' dentro dele
  const temUsuario = !!authData?.user;

  // Acessamos authData.user.nome com segurança
  const nomeDoAluno = authData?.user?.nome;

  return (
    <>
      <ToastContainer theme="colored" />
      <Header exibirUsuario={temUsuario} nomeUsuario={nomeDoAluno} />
      <Outlet />
    </>
  );
}

export default App;
