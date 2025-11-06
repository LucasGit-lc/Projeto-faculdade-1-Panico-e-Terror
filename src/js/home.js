// Produtos da página home
const produtosHome = {
    1: {
        id: 1,
        nome: 'Tênis Run Pro Max',
        categoria: 'Tênis',
        preco: 299.90,
        imagem_url: 'https://lojasdufins.com.br/cdn/shop/files/10_1_1_800x.webp?v=1745261891'
    },
    2: {
        id: 2,
        nome: 'Meia Cano Alto Pro',
        categoria: 'Roupas',
        preco: 29.90,
        imagem_url: 'https://m.media-amazon.com/images/I/51dfyNtWmOL._AC_SY606_.jpg'
    },
    3: {
        id: 3,
        nome: 'Jaqueta Windbreaker',
        categoria: 'Roupas',
        preco: 199.90,
        imagem_url: 'https://http2.mlstatic.com/D_NQ_NP_356611-MLB20597628199_022016-O.webp'
    },
    4: {
        id: 4,
        nome: 'Boné Running Dry',
        categoria: 'Acessórios',
        preco: 59.90,
        imagem_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
    },
    5: {
        id: 5,
        nome: 'Shorts Training Pro',
        categoria: 'Roupas',
        preco: 119.90,
        imagem_url: 'https://static.netshoes.com.br/produtos/bermuda-adidas-3s-masculina/02/2FW-5549-002/2FW-5549-002_zoom1.jpg?ts=1695423672'
    },
    6: {
        id: 6,
        nome: 'Mochila Tática 25L',
        categoria: 'Acessórios',
        preco: 149.90,
        imagem_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
    },
    7: {
        id: 7,
        nome: 'Relógio Garmin Forerunner',
        categoria: 'Acessórios',
        preco: 899.90,
        imagem_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
    }
};

// Função para adicionar produto ao carrinho na página home
function adicionarAoCarrinhoHome(produtoId) {
    const produto = produtosHome[produtoId];
    if (!produto) {
        alert('Produto não encontrado!');
        return;
    }
    
    const CART_KEY = (window.Sessao && typeof window.Sessao.getCartKey === 'function')
      ? window.Sessao.getCartKey()
      : 'carrinho';
    let carrinho = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    
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
    
    // Salvar no localStorage por usuário
    localStorage.setItem(CART_KEY, JSON.stringify(carrinho));
    
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