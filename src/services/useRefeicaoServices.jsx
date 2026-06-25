import { useState, useEffect, useCallback } from "react";
import { toast, Slide } from "react-toastify";

/**
 * Hook Customizado: useRefeicoesServices
 * Responsabilidades:
 *  1. Buscar a lista de refeições disponíveis para o aluno (GET)
 *  2. Agendar uma refeição escolhida pelo aluno (POST)
 *
 * @param {string|number} idAluno - ID do aluno logado
 */
export default function useRefeicoesServices(idAluno) {
  const [refeicoes, setRefeicoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // ==========================================
  // BUSCA DE REFEIÇÕES (GET)
  // ==========================================
  useEffect(() => {
    if (!idAluno) return;

    const buscarRefeicoes = async () => {
      setCarregando(true);
      try {
        // CORREÇÃO: a URL anterior tinha uma aspa dupla sobrando no início
        // da template string → `"http://...` causaria fetch para uma URL inválida.
        const resposta = await fetch(
          `http://localhost:3000/api/refeicoes/${idAluno}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!resposta.ok) {
          throw new Error("Erro ao buscar refeições.");
        }

        const dados = await resposta.json();
        setRefeicoes(dados);
      } catch (erro) {
        console.error("Erro na requisição:", erro);
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
  }, [idAluno]);

  // ==========================================
  // AGENDAMENTO DE REFEIÇÃO (POST)
  // Centralizado aqui para manter toda a lógica de rede em um único lugar.
  // A Home apenas chama esta função — sem conhecer detalhes da requisição.
  // ==========================================
  const agendarRefeicao = useCallback(
    async (refeicao) => {
      try {
        const resposta = await fetch(
          "http://localhost:3000/agendamento/criar",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idAluno,
              idRefeicao: refeicao.id,
            }),
          },
        );

        const resultado = await resposta.json();

        if (resultado.success) {
          console.log("Agendamento realizado:", resultado);
          toast.success("Refeição agendada com sucesso!", {
            position: "top-right",
            autoClose: 3000,
            transition: Slide,
          });
        } else {
          toast.error("Não foi possível agendar. Tente novamente.", {
            position: "top-right",
            autoClose: 4000,
            transition: Slide,
          });
        }
      } catch (erro) {
        console.error("Erro ao agendar refeição:", erro);
        toast.error("Servidor indisponível. Tente novamente.", {
          position: "top-right",
          autoClose: 4000,
          transition: Slide,
        });
      }
    },
    [idAluno],
  );

  return { refeicoes, carregando, agendarRefeicao };
}
