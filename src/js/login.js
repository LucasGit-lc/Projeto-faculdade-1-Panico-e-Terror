const loginForm = document.getElementById('loginForm');
const mensagem = document.getElementById('mensagem');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(loginForm);
  const dados = Object.fromEntries(formData);
  
  try {
    const response = await fetch('https://projeto-faculdade-1-panico-e-terror-production.up.railway.app/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados)
    });
    
    const resultado = await response.text();
    
    if (response.ok) {
      mensagem.style.color = 'green';
      mensagem.textContent = resultado;
      
      setTimeout(() => {
        window.location.href = 'dashboard.html'; 
      }, 1500);
    } else {
      mensagem.style.color = 'red';
      mensagem.textContent = resultado;
    }
  } catch (error) {
    mensagem.style.color = 'red';
    mensagem.textContent = 'Erro ao fazer login. Tente novamente.';
  }
});