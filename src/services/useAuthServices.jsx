import { useState } from "react";

export default function useAuthServices() {
  const [authLoading, setAuthLoading] = useState(false);

  /**
   * FUNÇÃO DE LOGIN
   * Recebe os dados do formulário e envia para o servidor.
   * @param {Object} dados - { matricula, codigo_refeitorio }
   */
  const login = (dados) => {
    setAuthLoading(true);

    const { matricula, codigo_refeitorio } = dados;

    const url = `http://localhost:3000/aluno/buscar?matricula=${matricula}&codigo=${codigo_refeitorio}`;

    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success && result.body) {
          console.log("Acesso autorizado para:", result.body.nome);

          localStorage.setItem(
            "auth",
            JSON.stringify({
              user: result.body,
            }),
          );

          // Reload é seguro aqui: aciona o useEffect do Login que redireciona para /home
          window.location.reload();
        } else {
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
   * FUNÇÃO DE LOGOUT
   * Remove a sessão e executa o callback de navegação fornecido pelo componente.
   * O hook não pode chamar useNavigate() diretamente porque
   * useAuthServices é usado também na página de Login, que pode estar fora
   * do contexto do Router em alguns cenários de teste. Receber o navegar
   * como parâmetro mantém o hook puro e reutilizável.
   *
   * @param {Function} navegar - Função navigate() do React Router
   */
  const logout = (navegar) => {
    localStorage.removeItem("auth");
    navegar("/");
  };

  return { login, logout, authLoading };
}
