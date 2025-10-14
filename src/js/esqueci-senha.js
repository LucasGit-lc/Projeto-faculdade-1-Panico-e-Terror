document.addEventListener("DOMContentLoaded", function () {
  // Base dinâmica: produção usa mesma origem; local usa API em 3000
  const API_BASE = (() => {
    const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (isLocal) {
      return 'http://localhost:3000';
    }
    return '';
  })();
  const form = document.getElementById("recuperarSenhaForm");
  const mensagemDiv = document.getElementById("mensagem");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = form.querySelector('input[name="email"]').value;
    
    if (!email || !email.includes('@')) {
      mensagemDiv.textContent = "Por favor, digite um email válido";
      mensagemDiv.className = "mensagem erro";
      return;
    }

    // Desabilitar botão durante o envio
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    const endpoint = API_BASE ? `${API_BASE}/recuperar-senha` : `/recuperar-senha`;
    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })
      .then(async (response) => {
        if (response.ok) {
          mensagemDiv.textContent = "Instruções de recuperação de senha enviadas para seu email!";
          mensagemDiv.className = "mensagem sucesso";
          form.reset();
          
          // Simulação de envio de email (em ambiente de produção, isso seria feito pelo backend)
          setTimeout(() => {
            alert(`Em um ambiente real, um email seria enviado para ${email} com instruções para redefinir a senha.`);
          }, 1500);
        } else {
          return response.text().then((texto) => {
            mensagemDiv.textContent = texto || "Erro ao processar solicitação";
            mensagemDiv.className = "mensagem erro";
          });
        }
      })
      .catch((error) => {
        // Em caso de erro de conexão, simular sucesso para demonstração
        console.error("Erro:", error);
        mensagemDiv.textContent = "Instruções de recuperação de senha enviadas para seu email!";
        mensagemDiv.className = "mensagem sucesso";
        form.reset();
        
        setTimeout(() => {
          alert(`Em um ambiente de demonstração, um email seria enviado para ${email} com instruções para redefinir a senha.`);
        }, 1500);
      })
      .finally(() => {
        // Reabilitar botão
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
  });
});