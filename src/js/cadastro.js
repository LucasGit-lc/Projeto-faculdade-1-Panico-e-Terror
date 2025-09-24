document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");

  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Impede o submit padrão

    const nome = form.querySelector('input[name="nome"]').value;
    const email = form.querySelector('input[name="email"]').value;
    const senha = form.querySelector('input[name="senha"]').value;

    // Validações básicas no frontend
    if (!nome || !email || !senha) {
      alert('❌ Preencha todos os campos!');
      return;
    }

    if (!email.includes('@')) {
      alert('❌ Email inválido!');
      return;
    }

    if (senha.length < 6) {
      alert('❌ Senha deve ter pelo menos 6 caracteres!');
      return;
    }

    // Desabilitar botão durante o envio
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Cadastrando...';

    const formData = new URLSearchParams();
    formData.append("nome", nome);
    formData.append("email", email);
    formData.append("senha", senha);

    fetch("https://projeto-faculdade-1-panico-e-terror-production.up.railway.app/cadastro", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          // Sucesso - mostrar mensagem e redirecionar
          alert('✅ Cadastro realizado com sucesso!\n\nVocê será redirecionado para o login em 3 segundos...');
          
          setTimeout(() => {
            window.location.href = "login.html";
          }, 3000);
        } else {
          // Erro - mostrar mensagem de erro
          return response.text().then((texto) => {
            alert('❌ ' + (texto || 'Erro ao realizar cadastro'));
          });
        }
      })
      .catch((error) => {
        alert('❌ Erro de conexão com o servidor');
        console.error("Erro:", error);
      })
      .finally(() => {
        // Reabilitar botão
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      });
  });
});