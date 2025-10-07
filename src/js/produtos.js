// Configuração da API
const API_BASE_URL = 'https://your-api-url.com'; // Substitua pela URL do seu servidor

// Chave do carrinho por usuário
const CART_KEY = (window.Sessao && typeof window.Sessao.getCartKey === 'function')
  ? window.Sessao.getCartKey()
  : 'carrinho';

// Variáveis globais
let produtos = [];
let carrinho = JSON.parse(localStorage.getItem(CART_KEY)) || [];

// Elementos do DOM
const productsGrid = document.getElementById('productsGrid');
const loadingMessage = document.getElementById('loadingMessage');
const noProductsMessage = document.getElementById('noProductsMessage');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const cartCount = document.getElementById('cartCount');

// Inicializar página
document.addEventListener('DOMContentLoaded', function() {
    carregarProdutos();
    atualizarContadorCarrinho();
    
    // Event listeners para filtros
    searchInput.addEventListener('input', debounce(filtrarProdutos, 300));
    categoryFilter.addEventListener('change', filtrarProdutos);
});

// Função para carregar produtos da API
async function carregarProdutos() {
    try {
        showLoading(true);
        
        // Para desenvolvimento local, usar dados mockados
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            produtos = getProdutosMockados();
            exibirProdutos(produtos);
        } else {
            const response = await fetch(`${API_BASE_URL}/produtos`);
            if (!response.ok) {
                throw new Error('Erro ao carregar produtos');
            }
            produtos = await response.json();
            exibirProdutos(produtos);
        }
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        // Fallback para dados mockados em caso de erro
        produtos = getProdutosMockados();
        exibirProdutos(produtos);
    } finally {
        showLoading(false);
    }
}

// Dados mockados para desenvolvimento
function getProdutosMockados() {
    return [
        {
            id: 1,
            nome: 'Tênis Run Pro Max',
            categoria: 'Tênis',
            preco: 299.90,
            descricao: 'Tênis esportivo verde com detalhes em castanho e branco, design moderno e tecnologia de amortecimento avançada',
            imagem_url: 'https://lojasdufins.com.br/cdn/shop/files/10_1_1_800x.webp?v=1745261891'
        },
        {
            id: 2,
            nome: 'Camiseta Performance',
            categoria: 'Camisetas',
            preco: 89.90,
            descricao: 'Camiseta esportiva de compressão preta com detalhes vermelhos e tecnologia dry-fit',
            imagem_url: 'https://www.dominusfitness.com.br/cdn/shop/files/camisa_de_compress_o_masclina.webp?v=1757830123'
        },
        {
            id: 3,
            nome: 'Shorts Training Pro',
            categoria: 'Shorts',
            preco: 119.90,
            descricao: 'Shorts esportivo preto com listras vermelhas laterais e bolso para celular',
            imagem_url: 'https://static.netshoes.com.br/produtos/bermuda-adidas-3s-masculina/02/2FW-5549-002/2FW-5549-002_zoom1.jpg?ts=1695423672'
        },
        {
            id: 4,
            nome: 'Jaqueta Windbreaker',
            categoria: 'Jaquetas',
            preco: 199.90,
            descricao: 'Jaqueta esportiva corta-vento vermelha com capuz e detalhes reflexivos',
            imagem_url: 'https://http2.mlstatic.com/D_NQ_NP_356611-MLB20597628199_022016-O.webp'
        },
        {
            id: 5,
            nome: 'Tênis Sport Elite',
            categoria: 'Tênis',
            preco: 349.90,
            descricao: 'Tênis esportivo de alta performance com design moderno e tecnologia avançada de amortecimento',
            imagem_url: 'https://olimpofit.com.br/cdn/shop/files/S927a584fe12544c9aa9b647a9df3c16bX_1024x1024@2x.webp?v=1719777153'
        }
    ];
}

// Função para exibir produtos na grid
function exibirProdutos(produtosParaExibir) {
    if (produtosParaExibir.length === 0) {
        productsGrid.innerHTML = '';
        noProductsMessage.style.display = 'block';
        return;
    }
    
    noProductsMessage.style.display = 'none';
    
    productsGrid.innerHTML = produtosParaExibir.map(produto => `
        <div class="product-card">
            <div class="product-image">
                <img src="${produto.imagem_url}" alt="${produto.descricao}" onerror="this.src='https://via.placeholder.com/250x250?text=Produto'">
            </div>
            <div class="product-info">
                <div class="product-category">${produto.categoria}</div>
                <h3 class="product-title">${produto.nome}</h3>
                <p class="product-description">${produto.descricao}</p>
                <div class="product-price">R$ ${produto.preco.toFixed(2).replace('.', ',')}</div>
                <button class="add-to-cart" onclick="adicionarAoCarrinho(${produto.id})">
                    Adicionar ao Carrinho
                </button>
            </div>
        </div>
    `).join('');
}

// Função para filtrar produtos
function filtrarProdutos() {
    const termoBusca = searchInput.value.toLowerCase().trim();
    const categoriaFiltro = categoryFilter.value;
    
    let produtosFiltrados = produtos.filter(produto => {
        const matchBusca = !termoBusca || 
            produto.nome.toLowerCase().includes(termoBusca) ||
            produto.descricao.toLowerCase().includes(termoBusca);
        
        const matchCategoria = !categoriaFiltro || produto.categoria === categoriaFiltro;
        
        return matchBusca && matchCategoria;
    });
    
    exibirProdutos(produtosFiltrados);
}

// Função para limpar filtros
function clearFilters() {
    searchInput.value = '';
    categoryFilter.value = '';
    exibirProdutos(produtos);
}

// Função para adicionar produto ao carrinho
function adicionarAoCarrinho(produtoId) {
    const produto = produtos.find(p => p.id === produtoId);
    if (!produto) {
        alert('Produto não encontrado!');
        return;
    }
    
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
    
    // Atualizar contador do carrinho
    atualizarContadorCarrinho();
    
    // Feedback visual
    mostrarNotificacao(`${produto.nome} adicionado ao carrinho!`);
}

// Função para atualizar contador do carrinho
function atualizarContadorCarrinho() {
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    cartCount.textContent = totalItens;
    cartCount.style.display = totalItens > 0 ? 'flex' : 'none';
}

// Função para mostrar/ocultar loading
function showLoading(show) {
    loadingMessage.style.display = show ? 'block' : 'none';
    productsGrid.style.display = show ? 'none' : 'grid';
}

// Função debounce para otimizar busca
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Função para mostrar notificações
function mostrarNotificacao(mensagem) {
    // Criar elemento de notificação
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

// Sincronizar quando houver atualização do carrinho
window.addEventListener('carrinhoAtualizado', function() {
  const key = (window.Sessao && typeof window.Sessao.getCartKey === 'function')
    ? window.Sessao.getCartKey()
    : CART_KEY;
  carrinho = JSON.parse(localStorage.getItem(key)) || [];
  atualizarContadorCarrinho();
});