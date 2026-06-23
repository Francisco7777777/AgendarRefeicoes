import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Slide } from "react-toastify";

/**
 * Hook Customizado: useTimerSessaoTotem
 * Finalidade: Controlar o tempo limite de sessão de um aluno no Totem e avisar a cada minuto.
 * @param {number} minutos - Tempo de duração da sessão
 */
export default function useTimerSessao(minutos) {
  const navegar = useNavigate();

  useEffect(() => {
    // Converte o tempo total para segundos para monitorar mais de perto
    let tempoRestanteSegundos = minutos * 60;

    const notify = (minuto) =>
      // Função da biblioteca react-toastify
      toast.info(`Restam apenas ${minuto} minuto(s) de sessão!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });

    // Cria um intervalo que roda a cada 1 segundo (1000ms)
    const cronometro = setInterval(() => {
      tempoRestanteSegundos -= 1;

      // A cada 60 segundos, dispara a notificação
      if (tempoRestanteSegundos % 60 === 0 && tempoRestanteSegundos > 0) {
        const minutosRestantes = tempoRestanteSegundos / 60;

        // DISPARO DA SUA NOTIFICAÇÃO
        notify(minutosRestantes);
      }

      // Se o tempo zerar, limpa o timer e desloga o aluno
      if (tempoRestanteSegundos <= 0) {
        clearInterval(cronometro);
        console.error("Sessão do Totem expirou!");

        localStorage.removeItem("auth");
        navegar("/");
        window.location.reload();
      }
    }, 1000);

    // Garante que se o aluno sair da tela antes, o intervalo de segundos é destruído
    return () => clearInterval(cronometro);
  }, [navegar, minutos]);
}
