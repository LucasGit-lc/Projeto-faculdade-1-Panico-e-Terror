// Produtos da página home
const produtosHome = {
    1: {
        id: 1,
        nome: 'Tênis Run Pro Max',
        categoria: 'Tênis',
        preco: 299.90,
        imagem_url: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/d24f59c9-440f-408d-824e-5d944f23930f.png'
    },
    2: {
        id: 2,
        nome: 'Camiseta Performance',
        categoria: 'Camisetas',
        preco: 89.90,
        imagem_url: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/c659cb72-5e97-4266-8ba8-ce3decd4bb6d.png'
    },
    3: {
        id: 3,
        nome: 'Shorts Training Pro',
        categoria: 'Shorts',
        preco: 119.90,
        imagem_url: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/e08bd690-309b-4d21-ba63-d20697047285.png'
    },
    4: {
        id: 4,
        nome: 'Jaqueta Windbreaker',
        categoria: 'Jaquetas',
        preco: 199.90,
        imagem_url: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/57030cb7-181c-4f32-8925-df8fa6886bd1.png'
    }
};

// Função para adicionar produto ao carrinho na página home
function adicionarAoCarrinhoHome(produtoId) {
    const produto = produtosHome[produtoId];
    if (!produto) {
        alert('Produto não encontrado!');
        return;
    }
    
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    
    // Verificar se o produto já está no carrinho
    const itemExistente = carrinho.find(item => item.id === produtoId);
    
    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            categoria: produto.categoria,
            preco: produto.preco,
            imagem_url: produto.imagem_url,
            quantidade: 1
        });
    }
    
    // Salvar no localStorage
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    
    // Feedback visual
    mostrarNotificacao(`${produto.nome} adicionado ao carrinho!`);
}

// Função para mostrar notificações
function mostrarNotificacao(mensagem) {
    const notificacao = document.createElement('div');
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #28a745;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: bold;
        animation: slideDown 0.3s ease;
    `;
    notificacao.textContent = mensagem;
    
    // Adicionar CSS da animação
    if (!document.getElementById('notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notificacao);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notificacao.remove();
    }, 3000);
}