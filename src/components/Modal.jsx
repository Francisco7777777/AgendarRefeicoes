import styles from "./Modal.module.css";

const Modal = ({ tipo }) => {
  if (!tipo) return null;

  console.log("modal " + tipo);

  return (
    <div className={styles.conteiner}>
      <div className={styles.conteudo}>
        <div>
          {tipo === "sair" ? (
            <p className={styles.menssagem}>Confirmar saída?</p>
          ) : (
            <p className={styles.menssagem}>
              Confirmar agendamento da refeição?
            </p>
          )}
        </div>
        <div className={styles.conteir_caixa}>
          <div className={styles.daixa_sim}>
            <span>SIM 1</span>
          </div>
          <div className={styles.daixa_nao}>
            <span>NÃO 0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
