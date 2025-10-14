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
    return isStaticDev ? 'http://localhost:3000' : location.origin;
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
          
          if (data.showLink && data.resetLink) {
            // Email falhou, mostrar link diretamente
            mensagemDiv.innerHTML = `
              <p>${data.mensagem}</p>
              <div style="margin: 15px 0; padding: 15px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px;">
                <p><strong>Clique no link abaixo para redefinir sua senha:</strong></p>
                <a href="${data.resetLink}" target="_blank" style="display: inline-block; padding: 10px 20px; background-color: #B32E25; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0;">Redefinir Senha</a>
                <p style="font-size: 12px; color: #666; margin-top: 10px;">Este link expira em 1 hora.</p>
              </div>
            `;
            mensagemDiv.className = "mensagem sucesso";
          } else {
            // Email enviado com sucesso
            mensagemDiv.textContent = data?.mensagem || "Instruções de recuperação de senha enviadas para seu email!";
            mensagemDiv.className = "mensagem sucesso";
          }
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