// Configuração da API
const API_BASE_URL = 'https://your-api-url.com'; // Substitua pela URL do seu servidor

// Chave do carrinho por usuário
const CART_KEY = (window.Sessao && typeof window.Sessao.getCartKey === 'function')
  ? window.Sessao.getCartKey()
  : 'carrinho';

// Variáveis globais
let produtos = [];
let carrinho = (window.SECURITY && window.SECURITY.carregarDadosProtegidos(CART_KEY)) || 
               JSON.parse(localStorage.getItem(CART_KEY)) || [];
let paginaAtual = 1;
const produtosPorPagina = 6;
let produtosFiltrados = [];

// Elementos do DOM
const productsGrid = document.getElementById('productsGrid');
const loadingMessage = document.getElementById('loadingMessage');
const noProductsMessage = document.getElementById('noProductsMessage');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const cartCount = document.getElementById('cartCount');
const loadMoreBtn = document.createElement('button');
loadMoreBtn.id = 'loadMoreBtn';
loadMoreBtn.textContent = 'Carregar mais';
loadMoreBtn.style.cssText = 'display:block;margin:20px auto;padding:10px 20px;background:#B32E25;color:#fff;border:none;border-radius:4px;cursor:pointer;';

// Inicializar página
document.addEventListener('DOMContentLoaded', function() {
    carregarProdutos();
    atualizarContadorCarrinho();
    
    // Event listeners para filtros
    searchInput.addEventListener('input', debounce(filtrarProdutos, 300));
    categoryFilter.addEventListener('change', filtrarProdutos);

    // Event listener para carregar mais
    loadMoreBtn.addEventListener('click', carregarMaisProdutos);
    productsGrid.after(loadMoreBtn);
    
    // Aplica filtros iniciais da URL após carregar
    setTimeout(() => {
        // Verificar se há busca na URL
        const buscaInicial = getBuscaFromURL();
        if (buscaInicial) {
            searchInput.value = buscaInicial;
            filtrarProdutos();
        } else {
            // Se não há busca, verificar categoria
            const categoriaInicial = getCategoriaFromURL();
            if (categoriaInicial) {
                categoryFilter.value = categoriaInicial;
                filtrarProdutos();
            }
        }
    }, 100);
});

// Lê categoria inicial da URL
function getCategoriaFromURL() {
    const params = new URLSearchParams(window.location.search);
    const categoria = params.get('categoria');
    return categoria ? decodeURIComponent(categoria) : '';
}

// Lê termo de busca inicial da URL
function getBuscaFromURL() {
    const params = new URLSearchParams(window.location.search);
    const busca = params.get('busca');
    return busca ? decodeURIComponent(busca) : '';
}

// Função para carregar produtos da API
async function carregarProdutos() {
    try {
        showLoading(true);
        
        // Usar dados mockados (funciona tanto local quanto no GitHub Pages)
        produtos = getProdutosMockados();
        exibirProdutos(produtos);
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
            emOferta: true,
            precoPromocional: 249.90,
            descricao: 'Tênis esportivo com tecnologia de amortecimento avançada, design moderno e conforto excepcional',
            imagem_url: 'https://lojasdufins.com.br/cdn/shop/files/10_1_1_800x.webp?v=1745261891'
        },
        {
            id: 2,
            nome: 'Meia Cano Alto Pro',
            categoria: 'Roupas',
            preco: 29.90,
            descricao: 'Meia esportiva de compressão com cano alto, amortecimento estratégico e tecnologia dry-fit',
            imagem_url: 'https://m.media-amazon.com/images/I/51dfyNtWmOL._AC_SY606_.jpg'
        },
        {
            id: 3,
            nome: 'Jaqueta Windbreaker',
            categoria: 'Roupas',
            preco: 199.90,
            emOferta: true,
            precoPromocional: 149.90,
            descricao: 'Jaqueta corta-vento com capuz, proteção contra vento e chuva leve, design esportivo',
            imagem_url: 'https://http2.mlstatic.com/D_NQ_NP_356611-MLB20597628199_022016-O.webp'
        },
        {
            id: 4,
            nome: 'Boné Running Dry',
            categoria: 'Acessórios',
            preco: 59.90,
            descricao: 'Boné esportivo com tecnologia dry-fit, proteção UV e ajuste personalizável',
            imagem_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        },
        {
            id: 5,
            nome: 'Shorts Training Pro',
            categoria: 'Roupas',
            preco: 119.90,
            emOferta: true,
            precoPromocional: 99.90,
            descricao: 'Shorts esportivo com bolso para celular, tecido respirável e design moderno',
            imagem_url: 'https://static.netshoes.com.br/produtos/bermuda-adidas-3s-masculina/02/2FW-5549-002/2FW-5549-002_zoom1.jpg?ts=1695423672'
        },
        {
            id: 6,
            nome: 'Mochila Tática 25L',
            categoria: 'Acessórios',
            preco: 149.90,
            descricao: 'Mochila tática resistente com compartimentos organizadores, ideal para aventuras outdoor',
            imagem_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        },
        {
            id: 7,
            nome: 'Relógio Garmin Forerunner',
            categoria: 'Acessórios',
            preco: 899.90,
            descricao: 'Smartwatch GPS com monitoramento de atividades, resistência à água e bateria longa duração',
            imagem_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        }
    ];
}

// Função para exibir produtos na grid
function exibirProdutos(produtosParaExibir) {
    const inicio = (paginaAtual - 1) * produtosPorPagina;
    const fim = inicio + produtosPorPagina;
    const produtosPagina = produtosParaExibir.slice(inicio, fim);

    if (produtosParaExibir.length === 0) {
        productsGrid.innerHTML = '';
        noProductsMessage.style.display = 'block';
        return;
    }
    
    noProductsMessage.style.display = 'none';

    // Limpa grade se for primeira página
    if (paginaAtual === 1) productsGrid.innerHTML = '';
    
    // Renderiza apenas produtos da página atual
    const cards = produtosPagina.map(produto => {
        const precoAtual = produto.preco;
        const precoPromo = produto.emOferta && produto.precoPromocional ? produto.precoPromocional : null;
        const precoFormatado = precoAtual.toFixed(2).replace('.', ',');
        const precoPromoFormatado = precoPromo ? precoPromo.toFixed(2).replace('.', ',') : null;
        const priceHTML = (precoPromo)
            ? `<div class="product-price"><span class="old-price">R$ ${precoFormatado}</span> <span class="promo-price">R$ ${precoPromoFormatado}</span></div>`
            : `<div class="product-price">R$ ${precoFormatado}</div>`;

        return `
        <div class="product-card">
            <div class="product-image">
                ${produto.emOferta ? '<span class="badge-oferta">Oferta</span>' : ''}
                <img src="${produto.imagem_url}" alt="${produto.descricao}" loading="lazy" width="250" height="250" onerror="this.src='https://via.placeholder.com/250x250?text=Produto'">
            </div>
            <div class="product-info">
                <div class="product-category">${produto.categoria}</div>
                <h3 class="product-title">${produto.nome}</h3>
                <p class="product-description">${produto.descricao}</p>
                ${priceHTML}
                <button class="add-to-cart" onclick="adicionarAoCarrinho(${produto.id})">
                    Adicionar ao Carrinho
                </button>
            </div>
        </div>`;
    }).join('');

    // Adiciona novos cards à grade
    productsGrid.insertAdjacentHTML('beforeend', cards);

    // Mostra/esconde botão Carregar mais
    loadMoreBtn.style.display = (fim >= produtosParaExibir.length) ? 'none' : 'block';
}

// Função para filtrar produtos
function filtrarProdutos() {
    const termoBusca = searchInput.value.toLowerCase().trim();
    const categoriaFiltro = categoryFilter.value;
    
    produtosFiltrados = produtos.filter(produto => {
        const matchBusca = !termoBusca || 
            produto.nome.toLowerCase().includes(termoBusca) ||
            produto.descricao.toLowerCase().includes(termoBusca);
        
        const matchCategoria = !categoriaFiltro || produto.categoria === categoriaFiltro;
        
        return matchBusca && matchCategoria;
    });

    // Reinicia paginação ao filtrar
    paginaAtual = 1;
    exibirProdutos(produtosFiltrados);
}

// Função para limpar filtros
function clearFilters() {
    searchInput.value = '';
    categoryFilter.value = '';
    paginaAtual = 1;
    productsGrid.innerHTML = '';
    exibirProdutos(produtos);
    // Remove parâmetro de categoria da URL
    if (window.history && typeof window.history.replaceState === 'function') {
        const urlSemParams = window.location.pathname;
        window.history.replaceState({}, document.title, urlSemParams);
    }
}

// Função para carregar mais produtos
function carregarMaisProdutos() {
    paginaAtual++;
    exibirProdutos(produtosFiltrados.length ? produtosFiltrados : produtos);
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
            preco: (produto.emOferta && produto.precoPromocional) ? produto.precoPromocional : produto.preco,
            imagem_url: produto.imagem_url,
            quantidade: 1
        });
    }
    
    // Salvar no localStorage por usuário (com proteção de segurança)
    if (window.SECURITY) {
        window.SECURITY.salvarDadosProtegidos(CART_KEY, carrinho);
    } else {
        localStorage.setItem(CART_KEY, JSON.stringify(carrinho));
    }
    
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