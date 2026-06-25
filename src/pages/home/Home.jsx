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
  useTempoSessao(2);
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
  // REFEIÇÕES (dados e ações via hook)
  // agendarRefeicao agora vem do hook — a Home não conhece detalhes da requisição.
  // ==========================================
  const { refeicoes, carregando, agendarRefeicao } = useRefeicoesServices(
    aluno?.id,
  );

  // ==========================================
  // ESTADO DO MODAL
  // null         → nenhum modal aberto
  // "sair"       → modal de confirmação de saída
  // { ...dados } → modal de agendamento com os dados da refeição escolhida
  // ==========================================
  const [estadoModal, setEstadoModal] = useState(null);

  // Ref espelho: permite que closures (listeners de teclado) leiam
  // o valor atual do estado sem precisar recriar o listener.
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
  // CALLBACK DE RESPOSTA DO MODAL
  // ==========================================
  const pegarEscolhaUsuario = useCallback(
    (escolha) => {
      const modalAtual = modalAtivoRef.current;

      if (escolha === "sim") {
        if (modalAtual === "sair") {
          // FLUXO DE SAÍDA: limpa sessão e redireciona para o Login
          logout(navegar);
          return; // O redirect desmonta o componente; não precisa fechar o modal.
        }

        if (modalAtual && typeof modalAtual === "object") {
          // FLUXO DE AGENDAMENTO: delega inteiramente ao hook
          agendarRefeicao(modalAtual);
        }
      }

      // "não" ou após confirmar agendamento: fecha o modal
      setEstadoModal(null);
    },
    [navegar, logout, agendarRefeicao],
  );

  // ==========================================
  // LISTENER GLOBAL DE TECLADO
  // ==========================================
  useEffect(() => {
    const tratarCliqueTeclado = (evento) => {
      const tecla = evento.key;
      const modalAtivo = modalAtivoRef.current;

      // Com qualquer modal aberto, a Home não processa teclas —
      // o Modal.jsx assume o controle do [1] e do [0].
      if (modalAtivo !== null) return;

      // [0] → abre modal de saída
      if (tecla === "0") {
        setEstadoModal("sair");
        return;
      }

      // [1–9] → abre modal de agendamento para a refeição do índice correspondente
      const indice = parseInt(tecla, 10);
      if (!isNaN(indice) && indice >= 1 && indice <= 9) {
        const refeicaoEscolhida = refeicoesRef.current[indice - 1];
        if (refeicaoEscolhida) {
          setEstadoModal(refeicaoEscolhida);
        }
      }
    };

    window.addEventListener("keydown", tratarCliqueTeclado);
    return () => window.removeEventListener("keydown", tratarCliqueTeclado);
  }, []); // Array vazio intencional: refs garantem acesso ao estado atual.

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
