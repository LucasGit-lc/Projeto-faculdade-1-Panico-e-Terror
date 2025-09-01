document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const mensagemDiv = document.getElementById("mensagem");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = form.querySelector('input[name="email"]').value;
    const senha = form.querySelector('input[name="senha"]').value;

    // Criar FormData para enviar como application/x-www-form-urlencoded
    const formData = new FormData();
    formData.append("email", email);
    formData.append("senha", senha);

    // Enviar requisição para o servidor no Railway com a URL correta
    fetch("https://miraculous-enchantment-production.up.railway.app/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          // Login bem-sucedido
          mensagemDiv.textContent = "Login realizado com sucesso!";
          mensagemDiv.className = "mensagem sucesso";

          // Redirecionar para a página home após 1 segundo
          setTimeout(() => {
            window.location.href = "home.html";
          }, 1000);
        } else {
          // Login falhou
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
