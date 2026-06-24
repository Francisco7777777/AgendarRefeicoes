import styles from "./Header.module.css";

const Header = ({ exibirUsuario }) => {
  let nomeUsuario = "";

  if (exibirUsuario) {
    const authString = localStorage.getItem("auth");
    const authData = authString ? JSON.parse(authString) : null;
    nomeUsuario = authData?.user?.nome || "Aluno";
  }

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src="/logo_ifce.png" alt="logo-IFCE" className={styles.img} />
      </div>
      <div className={styles.usuario}>
        {exibirUsuario && (
          <p className={styles.span_usuario}>Olá, {nomeUsuario}</p>
        )}
      </div>
    </header>
  );
};

export default Header;
