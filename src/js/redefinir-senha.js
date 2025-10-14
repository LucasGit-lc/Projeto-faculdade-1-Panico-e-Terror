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

  const form = document.getElementById("redefinirSenhaForm");
  const mensagemDiv = document.getElementById("mensagem");
  
  // Extrair token e email da URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const email = urlParams.get('email');
  
  if (!token || !email) {
    mensagemDiv.textContent = "Link inválido ou expirado. Solicite um novo link de recuperação.";
    mensagemDiv.className = "mensagem erro";
    form.style.display = "none";
    return;
  }
  
  // Preencher campos ocultos
  document.getElementById("token").value = token;
  document.getElementById("email").value = email;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const senha = form.querySelector('input[name="senha"]').value;
    const confirmarSenha = form.querySelector('input[name="confirmarSenha"]').value;
    
    if (senha.length < 6) {
      mensagemDiv.textContent = "A senha deve ter pelo menos 6 caracteres";
      mensagemDiv.className = "mensagem erro";
      return;
    }
    
    if (senha !== confirmarSenha) {
      mensagemDiv.textContent = "As senhas não coincidem";
      mensagemDiv.className = "mensagem erro";
      return;
    }

    // Desabilitar botão durante o envio
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processando...';

    const endpoint = API_BASE ? `${API_BASE}/redefinir-senha` : `/redefinir-senha`;
    const payload = { email, token, novaSenha: senha };

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          mensagemDiv.textContent = data?.mensagem || "Senha redefinida com sucesso!";
          mensagemDiv.className = "mensagem sucesso";
          form.reset();
          
          // Redirecionar para login após 2 segundos
          setTimeout(() => {
            window.location.href = "login.html";
          }, 2000);
        } else {
          const texto = await response.text();
          mensagemDiv.textContent = "Erro ao redefinir senha. Tente novamente.";
          mensagemDiv.className = "mensagem erro";
          console.error("Erro /redefinir-senha:", response.status, texto);
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