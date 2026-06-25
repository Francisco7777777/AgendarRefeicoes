import styles from "./Home.module.css";

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import useTempoSessao from "../../hooks/useTempoSessao.js";
import useAuthServices from "../../services/useAuthServices.jsx";
import useRefeicoesServices from "../../services/useRefeicaoServices.jsx";

import Modal from "../../components/Modal.jsx";
import Header from "../../components/Header.jsx";

const Home = () => {
  // ==========================================
  // SESSÃO E NAVEGAÇÃO
  // ==========================================
  useTempoSessao(60);
  const navegar = useNavigate();
  const { logout } = useAuthServices();

  // ==========================================
  // DADOS DO ALUNO LOGADO
  // ==========================================
  const authData = JSON.parse(localStorage.getItem("auth"));
  const aluno = authData?.user ?? null;

  // REGRA DE NEGÓCIO: situação "Regular" ou "Ativo" libera a lista.
  // Qualquer outro valor bloqueia com mensagem de situação irregular.
  const situacaoRegular =
    aluno?.situacao === "Regular" || aluno?.situacao === "Ativo";

  // ==========================================
  // REFEIÇÕES (dados dinâmicos da API)
  // ==========================================
  // O hook busca as refeições pelo ID do aluno logado
  const { refeicoes, carregando } = useRefeicoesServices(aluno?.id);

  // ==========================================
  // ESTADO DO MODAL
  // ==========================================
  // null         → nenhum modal aberto
  // "sair"       → modal de confirmação de saída
  // { ...dados } → modal de agendamento com os dados da refeição escolhida
  const [estadoModal, setEstadoModal] = useState(null);

  // Ref espelho: permite que o listener de teclado (closure) leia
  // o valor atual do estado sem precisar ser recriado a cada render.
  const modalAtivoRef = useRef(estadoModal);
  useEffect(() => {
    modalAtivoRef.current = estadoModal;
  }, [estadoModal]);

  // Ref espelho para a lista de refeições pelo mesmo motivo.
  const refeicoesRef = useRef(refeicoes);
  useEffect(() => {
    refeicoesRef.current = refeicoes;
  }, [refeicoes]);

  // ==========================================
  // FUNÇÃO DE AGENDAMENTO
  // Declarada antes do useCallback que a referencia.
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
              idAluno: aluno?.id,
              idRefeicao: refeicao.id,
            }),
          },
        );

        const resultado = await resposta.json();

        if (resultado.success) {
          console.log("Agendamento realizado:", resultado);
        } else {
          alert("Não foi possível agendar. Tente novamente.");
        }
      } catch (erro) {
        console.error("Erro ao agendar refeição:", erro);
        alert("Servidor indisponível. Tente novamente.");
      }
    },
    [aluno?.id],
  );

  // ==========================================
  // CALLBACK DE RESPOSTA DO MODAL
  // Declarado após agendarRefeicao para poder referenciá-la com segurança.
  // ==========================================
  const pegarEscolhaUsuario = useCallback(
    (escolha) => {
      const modalAtual = modalAtivoRef.current;

      if (escolha === "sim") {
        if (modalAtual === "sair") {
          // FLUXO DE SAÍDA: limpa sessão e vai para o Login
          logout(navegar);
          return; // O modal será desmontado pelo redirect; não precisa fechar.
        }

        if (modalAtual && typeof modalAtual === "object") {
          // FLUXO DE AGENDAMENTO: envia dados ao backend
          agendarRefeicao(modalAtual);
        }
      }

      // "não" ou após agendar: fecha o modal
      setEstadoModal(null);
    },
    [navegar, logout, agendarRefeicao],
  );

  // ==========================================
  // LISTENER GLOBAL DE TECLADO (Home)
  // ==========================================
  useEffect(() => {
    const tratarCliqueTeclado = (evento) => {
      const tecla = evento.key;
      const modalAtivo = modalAtivoRef.current;

      // Com qualquer modal aberto, a Home não processa teclas —
      // o próprio Modal.jsx cuida do [1] e [0].
      if (modalAtivo !== null) return;

      // [0] → abre modal de saída
      if (tecla === "0") {
        setEstadoModal("sair");
        return;
      }

      // [1–9] → tenta abrir modal de agendamento para a refeição de índice (tecla - 1)
      const indice = parseInt(tecla, 10);
      if (!isNaN(indice) && indice >= 1 && indice <= 9) {
        const refeicoesAtuais = refeicoesRef.current;
        const refeicaoEscolhida = refeicoesAtuais[indice - 1];

        if (refeicaoEscolhida) {
          // Passa o objeto completo da refeição como estado do modal
          setEstadoModal(refeicaoEscolhida);
        }
      }
    };

    window.addEventListener("keydown", tratarCliqueTeclado);
    return () => window.removeEventListener("keydown", tratarCliqueTeclado);
  }, []); // Array vazio: os refs garantem acesso ao estado atual sem recriar o listener

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================
  return (
    <>
      <Header exibirUsuario={true} />

      <main className={styles.main}>
        <div className={styles.conteine}>
          <h3 className={styles.titulo}>
            Digite o número da refeição para agendar.
          </h3>
          <p className={styles.paragrafo}>Tecle [0] e confirme para sair.</p>
        </div>

        {/* REGRA DE NEGÓCIO: bloqueia lista se situação irregular */}
        {!situacaoRegular ? (
          <p className={styles.situacao_irregular}>Situação irregular</p>
        ) : carregando ? (
          <p className={styles.carregando}>Carregando refeições...</p>
        ) : refeicoes.length === 0 ? (
          <p className={styles.sem_refeicoes}>
            Nenhuma refeição disponível no momento.
          </p>
        ) : (
          <div className={styles.conteiner_lista}>
            <ul className={styles.lista}>
              {refeicoes.map((refeicao, index) => (
                <li key={refeicao.id} className={styles.linha}>
                  <div className={styles.div_ordem}>
                    {/* Exibe a tecla que o aluno deve pressionar */}
                    <p>{index + 1}</p>
                  </div>
                  <div className={styles.conteiner_infor}>
                    <p className={styles.nome}>{refeicao.nome}</p>
                    <p className={styles.descricao}>{refeicao.descricao}</p>
                  </div>
                  <div className={styles.conteiner_status}>
                    <p className={styles.status}>{refeicao.status}</p>
                    <p className={styles.prazo}>{refeicao.horario}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      {/* Modal recebe o estado completo (objeto da refeição ou "sair") */}
      <Modal estado={estadoModal} pegarEscolhaUsuario={pegarEscolhaUsuario} />
    </>
  );
};

export default Home;
