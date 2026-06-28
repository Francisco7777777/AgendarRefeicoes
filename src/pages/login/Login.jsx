import styles from "./Login.module.css";

import { useEffect, useRef, useState } from "react";

import useAuthServices from "../../services/useAuthServices";

import { useNavigate } from "react-router-dom";

import Header from "../../components/Header";

const Login = () => {
  // Definição de Referências e Estados
  const matriculaRef = useRef(null);
  const codigoRef = useRef(null);

  const [erroMatricula, setErroMatricula] = useState("");
  const [erroCodigo, setErroCodigo] = useState("");

  const { login, authLoading } = useAuthServices();

  const navegar = useNavigate();

  const authData = JSON.parse(localStorage.getItem("auth"));

  // ==========================================
  // FUNÇÕES DE SUPORTE E OPERAÇÃO
  // ==========================================
  function focarNoFinal(inputElement) {
    if (inputElement) {
      inputElement.focus();
      const comprimentoTexto = inputElement.value.length;
      inputElement.setSelectionRange(comprimentoTexto, comprimentoTexto);
    }
  }

  function validarMatricula() {
    const matricula = matriculaRef.current?.value.trim();

    if (!matricula) {
      setErroMatricula("O campo Matrícula não pode ficar vazio!");
      focarNoFinal(matriculaRef.current);
      return false;
    }

    const apenasNumerosPositivos = /^[0-9]+$/;
    if (!apenasNumerosPositivos.test(matricula)) {
      setErroMatricula("Use apenas números inteiros e positivos!");
      if (matriculaRef.current) matriculaRef.current.value = "";
      focarNoFinal(matriculaRef.current);
      return false;
    }

    if (matricula.length !== 14) {
      setErroMatricula(
        `A matrícula deve ter 14 dígitos! (Digitado: ${matricula.length})`,
      );
      focarNoFinal(matriculaRef.current);
      return false;
    }
    return true;
  }

  function validarCodigo() {
    const codigo = codigoRef.current?.value.trim();

    if (!codigo) {
      setErroCodigo("O campo Código não pode ficar vazio!");
      focarNoFinal(codigoRef.current);
      return false;
    }

    const apenasNumeros = /^[0-9]+$/;
    if (!apenasNumeros.test(codigo)) {
      setErroCodigo("O Código deve conter apenas números!");
      if (codigoRef.current) codigoRef.current.value = "";
      focarNoFinal(codigoRef.current);
      return false;
    }

    if (codigo.length !== 3) {
      setErroCodigo(
        `O código deve ter 3 dígitos! (Digitado: ${codigo.length})`,
      );
      focarNoFinal(codigoRef.current);
      return false;
    }
    return true;
  }

  function processarEnvioDoFormulario() {
    const dadosForm = {
      matricula: matriculaRef.current.value.trim(),
      codigo_refeitorio: codigoRef.current.value.trim(),
    };

    if (matriculaRef.current) matriculaRef.current.value = "";
    if (codigoRef.current) codigoRef.current.value = "";

    setErroMatricula("");
    setErroCodigo("");

    login(dadosForm);

    focarNoFinal(matriculaRef.current);
  }

  // ==========================================
  // FOCO INICIAL AUTOMÁTICO NO CAMPO DE MATRÍCULA
  // ==========================================
  useEffect(() => {
    focarNoFinal(matriculaRef.current);
  }, []);

  // ==========================================
  // EVENTOS GATILHADOS PELO USUÁRIO (Ações do Teclado)
  // ==========================================
  const manipularMatriculaKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setErroMatricula("");

      const matriculaValida = validarMatricula();
      if (!matriculaValida) return;

      focarNoFinal(codigoRef.current);
    }
  };

  const manipularCodigoKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setErroMatricula("");
      setErroCodigo("");

      const matriculaOk = validarMatricula();
      if (!matriculaOk) return;

      const codigoOk = validarCodigo();
      if (!codigoOk) return;

      processarEnvioDoFormulario();
    }
  };

  useEffect(() => {
    if (authData) {
      navegar("/home");
    }
  }, [authData, navegar]);

  if (authLoading) {
    return <h1>Loading...</h1>;
  }

  // ==========================================
  // RENDERIZAÇÃO VISUAL (JSX)
  // ==========================================
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.div_texto}>
          <h2> Bem vindo(a)!</h2>
          <p className={styles.paragrafo}>
            Entre com a sua matrícula e o código para agendar as suas refeições.
          </p>
        </div>
        <div className={styles.div_formulario}>
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <label className={styles.label}>
              <span className={styles.span}>Matrícula</span>
              <input
                ref={matriculaRef}
                type="text"
                name="matricula"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Digite sua Matrícula"
                onKeyDown={manipularMatriculaKeyDown}
                required
                className={`${styles.input} ${erroMatricula ? styles.input_erro : ""}`}
              />
              {erroMatricula && (
                <span className={styles.msg_erro}>{erroMatricula}</span>
              )}
            </label>

            <label className={styles.label}>
              <span className={styles.span}>Código</span>
              <input
                ref={codigoRef}
                type="text"
                name="codigo"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Digite o codigo de acesso"
                onKeyDown={manipularCodigoKeyDown}
                required
                className={`${styles.input} ${erroCodigo ? styles.input_erro : ""}`}
              />
              {erroCodigo && (
                <span className={styles.msg_erro}>{erroCodigo}</span>
              )}
            </label>
          </form>
        </div>
      </main>
    </>
  );
};

export default Login;
