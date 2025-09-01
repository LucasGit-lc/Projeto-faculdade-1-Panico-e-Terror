document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('form');
  const mensagemDiv = document.getElementById('mensagem');

  form.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const email = form.querySelector('input[name="email"]').value;
    const senha = form.querySelector('input[name="senha"]').value;
    
    // Criar objeto com os dados do formulário
    const dados = {
      email: email,
      senha: senha
    };
    
    // Enviar requisição para o servidor no Railway
    fetch('https://projeto-faculdade-1-panico-e-terror-production.up.railway.app/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    })
    .then(response => {
      if (response.ok) {
        // Login bem-sucedido
        mensagemDiv.textContent = 'Login realizado com sucesso!';
        mensagemDiv.className = 'mensagem sucesso';
        
        // Redirecionar para a página home após 1 segundo
        setTimeout(() => {
          window.location.href = 'home.html';
        }, 1000);
      } else {
        // Login falhou
        return response.text().then(texto => {
          mensagemDiv.textContent = texto || 'Erro ao fazer login';
          mensagemDiv.className = 'mensagem erro';
        });
      }
    })
    .catch(error => {
      mensagemDiv.textContent = 'Erro de conexão com o servidor';
      mensagemDiv.className = 'mensagem erro';
      console.error('Erro:', error);
    });
  });
});