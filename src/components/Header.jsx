import styles from "./Header.module.css";

const Header = ({ exibirUsuario, nomeUsuario }) => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src="/logo_ifce.png" alt="logo-IFCE" className={styles.img} />
      </div>
      <div className={styles.usuario}>
        {exibirUsuario && (
          <p className={styles.span_usuario}>Óla, {nomeUsuario}</p>
        )}
      </div>
    </header>
  );
};

export default Header;
