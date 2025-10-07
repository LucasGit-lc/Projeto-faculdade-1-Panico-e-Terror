document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const mensagemDiv = document.getElementById("mensagem");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = form.querySelector('input[name="email"]').value;
    const senha = form.querySelector('input[name="senha"]').value;

    const formData = new URLSearchParams();
    formData.append("email", email);
    formData.append("senha", senha);

    fetch("https://miraculous-enchantment-production.up.railway.app/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    })
      .then(async (response) => {
        if (response.ok) {
          // Expect JSON com dados do usuário
          const usuario = await response.json();
          try {
            // Salvar sessão no localStorage
            if (window.Sessao && typeof window.Sessao.salvarSessao === 'function') {
              window.Sessao.salvarSessao(usuario);
            } else {
              localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
            }
          } catch (e) {
            console.warn('Falha ao salvar sessão:', e);
          }

          mensagemDiv.textContent = "Login realizado com sucesso!";
          mensagemDiv.className = "mensagem sucesso";

          setTimeout(() => {
            window.location.href = "home.html";
          }, 800);
        } else {
          return response.text().then((texto) => {
            mensagemDiv.textContent = texto || "Erro ao fazer login";
            mensagemDiv.className = "mensagem erro";
          });
        }
      })
      .catch((error) => {
        mensagemDiv.textContent = "Erro de conexão com o servidor";
        mensagemDiv.className = "mensagem erro";
        console.error("Erro:", error);
      });
  });
});
