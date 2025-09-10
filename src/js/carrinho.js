// Variáveis globais
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// Elementos do DOM
const cartContent = document.getElementById('cartContent');
const emptyCart = document.getElementById('emptyCart');
const cartItemsList = document.getElementById('cartItemsList');
const subtotalValue = document.getElementById('subtotalValue');
const shippingValue = document.getElementById('shippingValue');
const totalValue = document.getElementById('totalValue');
const checkoutBtn = document.getElementById('checkoutBtn');

// Inicializar página
document.addEventListener('DOMContentLoaded', function() {
    exibirCarrinho();
});

// Função para exibir o carrinho
function exibirCarrinho() {
    if (carrinho.length === 0) {
        cartContent.style.display = 'none';
        emptyCart.style.display = 'block';
        return;
    }
    
    cartContent.style.display = 'grid';
    emptyCart.style.display = 'none';
    
    // Renderizar itens do carrinho
    cartItemsList.innerHTML = carrinho.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="item-image">
                <img src="${item.imagem_url}" alt="${item.nome}" onerror="this.src='https://via.placeholder.com/100x100?text=Produto'">
            </div>
            
            <div class="item-info">
                <div class="item-name">${item.nome}</div>
                <div class="item-category">${item.categoria}</div>
                <div class="item-price">R$ ${item.preco.toFixed(2).replace('.', ',')}</div>
            </div>
            
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="alterarQuantidade(${item.id}, -1)" ${item.quantidade <= 1 ? 'disabled' : ''}>
                    −
                </button>
                <input type="number" class="quantity-input" value="${item.quantidade}" min="1" max="99" 
                       onchange="atualizarQuantidade(${item.id}, this.value)">
                <button class="quantity-btn" onclick="alterarQuantidade(${item.id}, 1)">
                    +
                </button>
            </div>
            
            <div class="item-subtotal">
                R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
            </div>
            
            <button class="remove-btn" onclick="removerItem(${item.id})">
                Remover
            </button>
        </div>
    `).join('');
    
    // Atualizar resumo
    atualizarResumo();
}

// Função para alterar quantidade
function alterarQuantidade(itemId, delta) {
    const item = carrinho.find(item => item.id === itemId);
    if (!item) return;
    
    const novaQuantidade = item.quantidade + delta;
    
    if (novaQuantidade <= 0) {
        removerItem(itemId);
        return;
    }
    
    if (novaQuantidade > 99) {
        mostrarNotificacao('Quantidade máxima é 99 unidades', 'warning');
        return;
    }
    
    item.quantidade = novaQuantidade;
    salvarCarrinho();
    exibirCarrinho();
}

// Função para atualizar quantidade diretamente
function atualizarQuantidade(itemId, novaQuantidade) {
    const quantidade = parseInt(novaQuantidade);
    
    if (isNaN(quantidade) || quantidade <= 0) {
        removerItem(itemId);
        return;
    }
    
    if (quantidade > 99) {
        mostrarNotificacao('Quantidade máxima é 99 unidades', 'warning');
        return;
    }
    
    const item = carrinho.find(item => item.id === itemId);
    if (item) {
        item.quantidade = quantidade;
        salvarCarrinho();
        exibirCarrinho();
    }
}

// Função para remover item do carrinho
function removerItem(itemId) {
    const itemIndex = carrinho.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;
    
    const item = carrinho[itemIndex];
    
    // Confirmar remoção
    if (confirm(`Deseja remover "${item.nome}" do carrinho?`)) {
        carrinho.splice(itemIndex, 1);
        salvarCarrinho();
        exibirCarrinho();
        mostrarNotificacao('Item removido do carrinho', 'success');
    }
}

// Função para atualizar resumo do pedido
function atualizarResumo() {
    const subtotal = carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    const frete = subtotal >= 200 ? 0 : 15.90; // Frete grátis acima de R$ 200
    const total = subtotal + frete;
    
    subtotalValue.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    shippingValue.textContent = frete === 0 ? 'Grátis' : `R$ ${frete.toFixed(2).replace('.', ',')}`;
    totalValue.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    
    // Habilitar/desabilitar botão de checkout
    checkoutBtn.disabled = carrinho.length === 0;
}

// Função para salvar carrinho no localStorage
function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    
    // Atualizar contador do carrinho em outras páginas
    window.dispatchEvent(new Event('carrinhoAtualizado'));
}

// Função para finalizar compra
function finalizarCompra() {
    if (carrinho.length === 0) {
        mostrarNotificacao('Seu carrinho está vazio!', 'warning');
        return;
    }
    
    // Verificar se usuário está logado
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (!usuarioLogado) {
        if (confirm('Você precisa estar logado para finalizar a compra. Deseja fazer login agora?')) {
            window.location.href = 'login.html';
        }
        return;
    }
    
    // Simular processo de checkout
    const total = carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    const frete = total >= 200 ? 0 : 15.90;
    const totalFinal = total + frete;
    
    const resumoPedido = {
        itens: carrinho,
        subtotal: total,
        frete: frete,
        total: totalFinal,
        data: new Date().toISOString(),
        usuario: JSON.parse(usuarioLogado)
    };
    
    // Salvar pedido no localStorage (em um sistema real, seria enviado para o servidor)
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    pedidos.push(resumoPedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    
    // Limpar carrinho
    carrinho = [];
    salvarCarrinho();
    
    // Mostrar confirmação
    alert(`Pedido realizado com sucesso!\n\nTotal: R$ ${totalFinal.toFixed(2).replace('.', ',')}\n\nVocê receberá um e-mail de confirmação em breve.`);
    
    // Redirecionar para página de produtos
    window.location.href = 'produtos.html';
}

// Função para limpar carrinho
function limparCarrinho() {
    if (carrinho.length === 0) return;
    
    if (confirm('Deseja remover todos os itens do carrinho?')) {
        carrinho = [];
        salvarCarrinho();
        exibirCarrinho();
        mostrarNotificacao('Carrinho limpo com sucesso', 'success');
    }
}

// Função para mostrar notificações
function mostrarNotificacao(mensagem, tipo = 'success') {
    const cores = {
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545',
        info: '#17a2b8'
    };
    
    const notificacao = document.createElement('div');
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${cores[tipo] || cores.success};
        color: ${tipo === 'warning' ? '#000' : '#fff'};
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: bold;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    notificacao.textContent = mensagem;
    
    // Adicionar CSS da animação se não existir
    if (!document.getElementById('notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notificacao);
    
    // Remover após 4 segundos
    setTimeout(() => {
        notificacao.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notificacao.remove(), 300);
    }, 4000);
}

// Função para calcular frete (pode ser expandida)
function calcularFrete(cep) {
    // Simulação de cálculo de frete
    // Em um sistema real, isso faria uma consulta a uma API de frete
    return new Promise((resolve) => {
        setTimeout(() => {
            const freteSimulado = Math.random() * 20 + 10; // Entre R$ 10 e R$ 30
            resolve(freteSimulado);
        }, 1000);
    });
}

// Event listeners
document.addEventListener('keydown', function(e) {
    // Atalho para limpar carrinho (Ctrl + Shift + C)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        limparCarrinho();
    }
});

// Listener para atualização do carrinho
window.addEventListener('carrinhoAtualizado', function() {
    carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    exibirCarrinho();
});