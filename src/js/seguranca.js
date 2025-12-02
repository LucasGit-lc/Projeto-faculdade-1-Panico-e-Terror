/**
 * MÓDULO DE SEGURANÇA - PROTEÇÃO CONTRA MANIPULAÇÃO NO FRONTEND
 * 
 * Este módulo implementa várias camadas de segurança para proteger
 * os dados do carrinho e checkout contra manipulação via DevTools.
 */

const SECURITY = {
    // Chave secreta para assinatura (em produção, isso seria gerado dinamicamente)
    SECRET_KEY: 'panicoterror_secure_key_2025',
    
    // Versão do formato de dados
    DATA_VERSION: 1,
    
    /**
     * Gera um hash simples para validar integridade dos dados
     * @param {string} dados - Dados a serem hasheados
     * @returns {string} Hash resultante
     */
    gerarHash: function(dados) {
        let hash = 0;
        const str = typeof dados === 'string' ? dados : JSON.stringify(dados);
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Converter para inteiro de 32 bits
        }
        
        return Math.abs(hash).toString(16);
    },
    
    /**
     * Cria uma assinatura para proteger dados
     * @param {object} dados - Dados a serem assinados
     * @returns {object} Dados com assinatura
     */
    assinarDados: function(dados) {
        const dataStr = JSON.stringify({
            versao: this.DATA_VERSION,
            dados: dados,
            timestamp: Date.now()
        });
        
        const hash = this.gerarHash(dataStr + this.SECRET_KEY);
        
        return {
            v: this.DATA_VERSION,
            d: dados,
            ts: Date.now(),
            sig: hash
        };
    },
    
    /**
     * Valida a assinatura dos dados
     * @param {object} dadosAssinados - Dados com assinatura
     * @returns {boolean} True se válido, false caso contrário
     */
    validarAssinatura: function(dadosAssinados) {
        if (!dadosAssinados || typeof dadosAssinados !== 'object') {
            return false;
        }
        
        if (dadosAssinados.v !== this.DATA_VERSION) {
            console.warn('❌ Versão de dados incompatível detectada');
            return false;
        }
        
        const dataStr = JSON.stringify({
            versao: dadosAssinados.v,
            dados: dadosAssinados.d,
            timestamp: dadosAssinados.ts
        });
        
        const hashEsperado = this.gerarHash(dataStr + this.SECRET_KEY);
        const hashRecebido = dadosAssinados.sig;
        
        if (hashEsperado !== hashRecebido) {
            console.warn('❌ Assinatura inválida - Dados foram modificados!');
            return false;
        }
        
        // Verificar timestamp (dados não devem ter mais de 24 horas)
        const idadeMS = Date.now() - dadosAssinados.ts;
        const idade24horas = 24 * 60 * 60 * 1000;
        
        if (idadeMS > idade24horas) {
            console.warn('❌ Dados expirados detectados');
            return false;
        }
        
        return true;
    },
    
    /**
     * Salva dados protegidos no localStorage
     * @param {string} chave - Chave do localStorage
     * @param {object} dados - Dados a serem salvos
     */
    salvarDadosProtegidos: function(chave, dados) {
        try {
            const dadosAssinados = this.assinarDados(dados);
            localStorage.setItem(chave, JSON.stringify(dadosAssinados));
        } catch (erro) {
            console.error('Erro ao salvar dados protegidos:', erro);
        }
    },
    
    /**
     * Carrega e valida dados protegidos do localStorage
     * @param {string} chave - Chave do localStorage
     * @returns {object|null} Dados se válidos, null caso contrário
     */
    carregarDadosProtegidos: function(chave) {
        try {
            const dadosStr = localStorage.getItem(chave);
            if (!dadosStr) return null;
            
            const dadosAssinados = JSON.parse(dadosStr);
            
            if (!this.validarAssinatura(dadosAssinados)) {
                console.error('⚠️ Tentativa de manipulação detectada em:', chave);
                console.error('Dados serão descartados por segurança');
                return null;
            }
            
            return dadosAssinados.d;
        } catch (erro) {
            console.error('Erro ao carregar dados protegidos:', erro);
            return null;
        }
    },
    
    /**
     * Valida itens do carrinho
     * @param {array} carrinho - Array de itens do carrinho
     * @returns {boolean} True se válido, false caso contrário
     */
    validarCarrinho: function(carrinho) {
        if (!Array.isArray(carrinho)) {
            console.warn('❌ Carrinho não é um array');
            return false;
        }
        
        for (const item of carrinho) {
            // Validar estrutura básica
            if (!item.id || !item.nome || !item.preco || !item.quantidade) {
                console.warn('❌ Item do carrinho com estrutura inválida:', item);
                return false;
            }
            
            // Validar tipos
            if (typeof item.id !== 'number' || item.id <= 0) {
                console.warn('❌ ID do item inválido:', item.id);
                return false;
            }
            
            if (typeof item.preco !== 'number' || item.preco <= 0) {
                console.warn('❌ Preço do item inválido:', item.preco);
                return false;
            }
            
            if (!Number.isInteger(item.quantidade) || item.quantidade <= 0 || item.quantidade > 99) {
                console.warn('❌ Quantidade do item inválida:', item.quantidade);
                return false;
            }
            
            // Validar string do nome
            if (typeof item.nome !== 'string' || item.nome.length === 0) {
                console.warn('❌ Nome do item inválido:', item.nome);
                return false;
            }
        }
        
        return true;
    },
    
    /**
     * Valida dados do checkout
     * @param {object} dados - Dados do checkout
     * @returns {object} {valido: boolean, erros: array}
     */
    validarCheckout: function(dados) {
        const erros = [];
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(dados.email)) {
            erros.push('Email inválido');
        }
        
        // Validar telefone
        const telRegex = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;
        if (!telRegex.test(dados.telefone)) {
            erros.push('Telefone inválido');
        }
        
        // Validar CEP
        const cepRegex = /^\d{5}-?\d{3}$/;
        if (!cepRegex.test(dados.cep)) {
            erros.push('CEP inválido');
        }
        
        // Validar cartão (apenas validação básica)
        if (!/^\d{16}$/.test(dados.numeroCartao?.replace(/\s/g, ''))) {
            erros.push('Número de cartão inválido');
        }
        
        // Validar validade
        if (!/^\d{2}\/\d{2}$/.test(dados.validade)) {
            erros.push('Validade do cartão inválida');
        }
        
        // Validar CVV
        if (!/^\d{3}$/.test(dados.cvv)) {
            erros.push('CVV inválido');
        }
        
        return {
            valido: erros.length === 0,
            erros: erros
        };
    },
    
    /**
     * Sanitiza string para evitar XSS
     * @param {string} str - String a ser sanitizada
     * @returns {string} String sanitizada
     */
    sanitizar: function(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    },
    
    /**
     * Detecta tentativas de manipulação
     * @returns {boolean} True se manipulação for detectada
     */
    detectarManipulacao: function() {
        // Verificar se DevTools está aberto
        const isDevToolsOpen = this.verificarDevTools();
        
        if (isDevToolsOpen) {
            console.warn('⚠️ Atividade suspeita detectada');
        }
        
        return isDevToolsOpen;
    },
    
    /**
     * Verifica se DevTools está aberto
     * @returns {boolean}
     */
    verificarDevTools: function() {
        const threshold = 160;
        
        if (window.outerHeight - window.innerHeight > threshold ||
            window.outerWidth - window.innerWidth > threshold) {
            return true;
        }
        
        const test = /./;
        test.toString = function() {
            return 'console aberto';
        };
        
        try {
            console.log(test);
        } catch (e) {
            // Não faz nada
        }
        
        return false;
    },
    
    /**
     * Registra atividade suspeita
     * @param {string} atividade - Descrição da atividade
     */
    registrarAtividadeSuspeita: function(atividade) {
        const registro = {
            timestamp: new Date().toISOString(),
            atividade: atividade,
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        // Armazenar em um array de suspeitas (máximo 50)
        let suspeitas = JSON.parse(localStorage.getItem('suspeitas_seguranca') || '[]');
        suspeitas.push(registro);
        
        if (suspeitas.length > 50) {
            suspeitas = suspeitas.slice(-50);
        }
        
        localStorage.setItem('suspeitas_seguranca', JSON.stringify(suspeitas));
        
        console.warn('🔐 Atividade registrada para análise:', atividade);
    }
};

// Disponibilizar globalmente
window.SECURITY = SECURITY;

// Log de inicialização
console.log('🔐 Sistema de segurança ativado');
