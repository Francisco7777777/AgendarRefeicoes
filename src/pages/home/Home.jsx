import useTimerSessao from "../../hooks/useTimerSessao";

import styles from "./Home.module.css";

import Modal from "../../components/Modal.jsx";

import { useState, useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";

const Home = () => {
  useTimerSessao(60);
  const navegar = useNavigate();

  // Estado único para controlar o modal: pode ser null, "reserva" ou "sair"
  const [modalAtivo, setModalAtivo] = useState(null);
  console.log("Home " + modalAtivo);

  // Criamos uma referência para o teclado sempre saber o estado real
  const modalAtivoRef = useRef(modalAtivo);

  // Toda vez que o estado mudar, atualizamos a referência
  useEffect(() => {
    modalAtivoRef.current = modalAtivo;
  }, [modalAtivo]);

  useEffect(() => {
    const tratarCliqueTeclado = (evento) => {
      const tecla = evento.key;
      console.log(`O aluno apertou: ${tecla}`);

      // Lemos o valor direto da referência (.current) para evitar o efeito fantasma
      const estadoAtualModal = modalAtivoRef.current;

      // ==========================================
      // CASO A: SE JÁ EXISTE UM MODAL ABERTO (SIM/NÃO)
      // ==========================================
      if (estadoAtualModal !== null) {
        if (tecla === "1") {
          console.log("Confirmou com SIM [1]");

          if (estadoAtualModal === "sair") {
            localStorage.removeItem("auth");
            navegar("/");
            window.location.reload();
          } else if (estadoAtualModal === "reserva") {
            console.log("Reserva realizada com sucesso!");
            setModalAtivo(null);
          }
        }

        if (tecla === "0") {
          console.log("Cancelou com NÃO [0]");
          setModalAtivo(null); // Fecha o modal
        }
        return; // Interrompe para não ler as regras de baixo
      }

      // ==========================================
      // CASO B: SE NENHUM MODAL ESTIVER ABERTO (ABRE MODAL)
      // ==========================================
      if (tecla === "0") {
        setModalAtivo("sair");
      }
      if (tecla === "1") {
        setModalAtivo("reserva");
      }
    };

    // Escuta o teclado do Totem
    window.addEventListener("keydown", tratarCliqueTeclado);

    // Limpa o evento ao sair da tela
    return () => {
      window.removeEventListener("keydown", tratarCliqueTeclado);
    };
  }, [navegar]); // Array vazia funciona perfeitamente agora por causa do useRef!

  return (
    <>
      <main className={styles.main}>
        <div className={styles.conteine}>
          <h3 className={styles.titulo}>
            Digite o número da refeição para agendar.
          </h3>
          <p className={styles.paragrafo}>Teclar 0 e confirme para sair.</p>
        </div>
        <div className={styles.conteiner_lista}>
          <ul className={styles.lista}>
            <li className={styles.linha}>
              <div className={styles.div_ordem}>
                <p>1</p>
              </div>
              <div className={styles.detalhes_refeicao}>
                <p className={styles.nome}>Lanche Manha</p>
                <p className={styles.descricao}>
                  Paõ com ovos e suco de goiaba
                </p>
              </div>
              <dir className={styles.div_}>
                <p>Reservado</p>
                <p className={styles.Prazo}>09:00</p>
              </dir>
            </li>
          </ul>
        </div>
      </main>
      <Modal tipo={modalAtivo} />
    </>
  );
};

export default Home;
