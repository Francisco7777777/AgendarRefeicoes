import { useState } from "react";

export default function useAuthServices() {
  const [authLoading, setAuthLoading] = useState(false);

  /**
   * FUNÇÃO DE LOGIN
   * Recebe os dados do formulário e envia para o servidor.
   * @param {Object} dados
   */

  const login = (dados) => {
    setAuthLoading(true);

    const { matricula, codigo_refeitorio } = dados;

    // Monta a URL de busca rápida com os parâmetros (Query Params)
    const url = `http://localhost:3000/aluno/buscar?matricula=${matricula}&codigo=${codigo_refeitorio}`;

    // Dispara a requisição GET para o backend
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((result) => {
        // Se o backend encontrar o aluno com sucesso
        if (result.success && result.body) {
          console.log("Acesso autorizado para:", result.body.nome);

          // Salva os dados do aluno no localStorage no formato esperado pelo seu app
          localStorage.setItem(
            "auth",
            JSON.stringify({
              user: result.body, // Aqui ficam guardados nome, matrícula, etc.
            }),
          );

          // Redireciona ou atualiza a página para entrar no sistema
          window.location.reload();
        } else {
          // Se o backend retornar false ou não encontrar o documento
          alert("Erro: Matrícula ou Código do refeitório incorretos!");
        }
      })
      .catch((error) => {
        console.error("Erro ao conectar com o servidor do Totem:", error);
        alert("Servidor indisponível no momento.");
      })
      .finally(() => {
        setAuthLoading(false);
      });
  };

  /**
   * FUNÇÃO DE LOGOUT (SAIR)
   * Apaga a sessão do usuário de forma simples e rápida.
   */
  const logout = () => {
    localStorage.removeItem("auth");
  };

  return { login, logout, authLoading };
}
