import { useState, useEffect } from "react";
import { toast, Slide } from "react-toastify";

/**
 * Hook Customizado: useRefeicoesAluno
 * Finalidade: Fazer uma requisição HTTP GET para buscar as refeições de um aluno específico.
 * @param {string|number} idAluno - O ID ou Matrícula do aluno logado
 */
export default function useRefeicoesServices(idAluno) {
  const [refeicoes, setRefeicoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Se não houver ID do aluno, não faz a requisição
    if (!idAluno) return;

    const buscarRefeicoes = async () => {
      setCarregando(true);
      try {
        // Método HTTP GET simulado apontando para a API do SISREF
        // Passamos o idAluno na própria URL (Parâmetro de Rota)
        const resposta = await fetch(
          `https://sisref.ifce.edu.br/api/refeicoes/${idAluno}`,
          {
            method: "GET", // <--- O Método HTTP solicitado
            headers: {
              "Content-Type": "application/json",
              // Geralmente sistemas como o SISREF exigem o token guardado no localStorage
              Authorization: `Bearer ${localStorage.getItem("token_sisref")}`,
            },
          },
        );

        if (!resposta.ok) {
          throw new Error("Erro ao buscar refeições!!!");
        }

        const dados = await resposta.json();

        // Guarda os dados das refeições recebidas no estado do React
        setRefeicoes(dados);
      } catch (erro) {
        console.error("Erro na requisição:", erro);

        // Exibe um alerta visual amigável usando o react-toastify
        toast.error(
          "Não foi possível carregar suas refeições. Tente novamente!",
          {
            position: "top-right",
            autoClose: 4000,
            transition: Slide,
          },
        );
      } finally {
        setCarregando(false);
      }
    };

    buscarRefeicoes();
  }, [idAluno]); // O useEffect roda novamente caso o idAluno mude

  // Retorna os dados das refeições e o status de carregamento para o componente visual usar
  return { refeicoes, carregando };
}
