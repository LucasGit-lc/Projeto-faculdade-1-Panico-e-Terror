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
        nome: 'Camiseta Performance',
        categoria: 'Camisetas',
        preco: 89.90,
        imagem_url: 'https://www.dominusfitness.com.br/cdn/shop/files/camisa_de_compress_o_masclina.webp?v=1757830123'
    },
    3: {
        id: 3,
        nome: 'Shorts Training Pro',
        categoria: 'Shorts',
        preco: 119.90,
        imagem_url: 'https://static.netshoes.com.br/produtos/bermuda-adidas-3s-masculina/02/2FW-5549-002/2FW-5549-002_zoom1.jpg?ts=1695423672'
    },
    4: {
        id: 4,
        nome: 'Jaqueta Windbreaker',
        categoria: 'Jaquetas',
        preco: 199.90,
        imagem_url: 'https://http2.mlstatic.com/D_NQ_NP_356611-MLB20597628199_022016-O.webp'
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