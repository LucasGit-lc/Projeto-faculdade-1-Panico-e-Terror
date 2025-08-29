document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const mensagemDiv = document.getElementById('mensagem');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        
        if (!email || !senha) {
            exibirMensagem('Preencha todos os campos!', 'erro');
            return;
        }
        
        try {
            const response = await fetch('https://projeto-faculdade-1-panico-e-terror-production.up.railway.app/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `email=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`,
            });
            
            const texto = await response.text();
            
            if (response.ok) {
                exibirMensagem('Login realizado com sucesso! Redirecionando...', 'sucesso');
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1500);
            } else {
                exibirMensagem(texto || 'Erro ao fazer login', 'erro');
            }
        } catch (err) {
            exibirMensagem('Erro ao conectar com o servidor', 'erro');
            console.error(err);
        }
    });
    
    function exibirMensagem(texto, tipo) {
        mensagemDiv.textContent = texto;
        mensagemDiv.className = 'mensagem';
        mensagemDiv.classList.add(tipo);
        
        // Fazer a mensagem desaparecer após 5 segundos se for de erro
        if (tipo === 'erro') {
            setTimeout(() => {
                mensagemDiv.style.display = 'none';
            }, 5000);
        }
    }
});