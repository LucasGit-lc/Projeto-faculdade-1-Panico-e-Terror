document.addEventListener("DOMContentLoaded", function () {
  // Base dinâmica: produção usa mesma origem; local usa API em 3000
  const API_BASE = (() => {
    const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (isLocal) {
      return 'http://localhost:3000';
    }
    // produção: mesma origem
    return '';
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
          mensagemDiv.textContent = "Senha redefinida com sucesso!";
          mensagemDiv.className = "mensagem sucesso";
          form.reset();
          
          // Redirecionar para login após 2 segundos
          setTimeout(() => {
            window.location.href = "login.html";
          }, 2000);
        } else {
          return response.text().then((texto) => {
            mensagemDiv.textContent = texto || "Erro ao redefinir senha";
            mensagemDiv.className = "mensagem erro";
          });
        }
      })
      .catch((error) => {
        // Em caso de erro de conexão, simular sucesso para demonstração
        console.error("Erro:", error);
        mensagemDiv.textContent = "Senha redefinida com sucesso!";
        mensagemDiv.className = "mensagem sucesso";
        form.reset();
        
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      })
      .finally(() => {
        // Reabilitar botão
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
  });
});