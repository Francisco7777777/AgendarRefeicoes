import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ← adiciona este import

export default function useAuthServices() {
  const [authLoading, setAuthLoading] = useState(false);
  const navegar = useNavigate(); // ← adiciona esta linha

  const login = (dados) => {
    setAuthLoading(true);

    const { matricula, codigo_refeitorio } = dados;
    const url = `http://localhost:3000/aluno/buscar?matricula=${matricula}&codigo=${codigo_refeitorio}`;

    fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success && result.body) {
          console.log("Acesso autorizado para:", result.body.nome);

          localStorage.setItem("auth", JSON.stringify({ user: result.body }));

          // CORREÇÃO: navegar diretamente, sem reload()
          navegar("/home");
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

  const logout = (navegar) => {
    localStorage.removeItem("auth");
    navegar("/");
  };

  return { login, logout, authLoading };
}
