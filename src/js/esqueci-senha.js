document.addEventListener("DOMContentLoaded", function () {
  // Base dinâmica: lê meta[name="api-base"] em produção; no dev estático local (porta != 3000) usa http://localhost:3000; caso contrário, mesma origem
  const API_BASE = (() => {
    const metaApi = document.querySelector('meta[name="api-base"]');
    const configured = metaApi?.content?.trim();
    if (configured) return configured;
    const host = location.hostname;
    const port = location.port;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';
    const isStaticDev = isLocalHost && port && port !== '3000';
    return isStaticDev ? 'http://localhost:3000' : '';
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
          const data = await response.json().catch(() => ({}));
          mensagemDiv.textContent = data?.mensagem || "Instruções de recuperação de senha enviadas para seu email!";
          mensagemDiv.className = "mensagem sucesso";
          form.reset();
        } else {
          const texto = await response.text();
          // Evita exibir HTML bruto (ex.: 405 de servidor estático)
          mensagemDiv.textContent = "Não foi possível enviar o link. Tente novamente.";
          mensagemDiv.className = "mensagem erro";
          console.error("Erro /recuperar-senha:", response.status, texto);
        }
      })
      .catch((error) => {
        console.error("Erro de conexão:", error);
        mensagemDiv.textContent = "Falha de conexão com o servidor. Tente novamente.";
        mensagemDiv.className = "mensagem erro";
      })
      .finally(() => {
        // Reabilitar botão
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
  });
});