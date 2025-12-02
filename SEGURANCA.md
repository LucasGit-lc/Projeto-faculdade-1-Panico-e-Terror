# 🔐 Sistema de Segurança - Proteção Frontend

## Visão Geral

Este documento descreve as camadas de segurança implementadas para proteger os dados do carrinho e checkout contra manipulação através do console/DevTools do navegador.

## Camadas de Segurança Implementadas

### 1. **Assinatura Digital de Dados**
- Todos os dados sensíveis (carrinho, pedidos) são assinados com uma hash criptográfica
- Ao carregar, a assinatura é validada para detectar modificações
- Se detectada manipulação, os dados são descartados e um aviso é registrado

**Arquivo:** `src/js/seguranca.js` - Função `assinarDados()` e `validarAssinatura()`

### 2. **Validação Rigorosa de Tipos**
```javascript
// Validações implementadas:
- ID deve ser número positivo
- Preço deve ser número positivo
- Quantidade deve ser inteiro entre 1 e 99
- Nome deve ser string não-vazia
- Email deve ter formato válido
- Telefone deve ter formato válido
- CEP deve ter formato válido
- Cartão deve ter 16 dígitos
- Validade deve ser MM/AA
```

**Arquivo:** `src/js/seguranca.js` - Função `validarCarrinho()` e `validarCheckout()`

### 3. **Detecção de DevTools**
- Verifica se DevTools está aberto durante o checkout
- Se detectado, cancela a operação e registra a atividade
- Verifica dimensões da janela e comportamento do console

**Arquivo:** `src/js/seguranca.js` - Função `verificarDevTools()`

### 4. **Registro de Atividades Suspeitas**
- Todas as tentativas de manipulação são registradas
- Dados armazenados com timestamp, URL e user agent
- Máximo de 50 registros mantidos no localStorage

**Arquivo:** `src/js/seguranca.js` - Função `registrarAtividadeSuspeita()`

### 5. **Sanitização de Dados**
- Strings são sanitizadas para prevenir XSS
- Caracteres especiais são escapados
- Proteção contra injeção de código

**Arquivo:** `src/js/seguranca.js` - Função `sanitizar()`

### 6. **Validação de Deltas em Quantidade**
- Ao alterar quantidade, apenas delta de -1 ou 1 é permitido
- Tentativas de manipulação direta são bloqueadas

**Arquivo:** `src/js/carrinho.js` - Função `alterarQuantidade()`

### 7. **Proteção no Checkout**
- Valida carrinho antes de processar
- Detecta DevTools durante checkout
- Valida todos os dados do formulário
- Verifica assinatura de dados antes de salvar pedido

**Arquivo:** `src/js/carrinho.js` - Função `confirmarCompra()`

### 8. **Expiração de Dados**
- Dados com assinatura expiram após 24 horas
- Dados antigos não são aceitos
- Força recarregamento de dados frescos

**Arquivo:** `src/js/seguranca.js` - Validação em `validarAssinatura()`

## O Que É Protegido

### Carrinho de Compras
- ✅ Impossível adicionar quantidades negativas
- ✅ Impossível modificar preços
- ✅ Impossível adicionar produtos inexistentes
- ✅ Impossível alterar estrutura dos itens

### Checkout
- ✅ Impossível modificar total da compra
- ✅ Impossível contornar validação de dados
- ✅ Impossível completar checkout com DevTools aberto
- ✅ Email, telefone, CEP e cartão validados

### Dados Sensíveis
- ✅ Todos os dados têm assinatura digital
- ✅ Modificações são detectadas automaticamente
- ✅ Dados manipulados são descartados
- ✅ Atividades suspeitas são registradas

## Como Funciona na Prática

### Exemplo: Tentativa de Manipular Cartão
```javascript
// ❌ Isso não funciona:
const cartao = JSON.parse(localStorage.getItem('carrinho_usuario@email.com'));
cartao.d[0].preco = 0.01;
localStorage.setItem('carrinho_usuario@email.com', JSON.stringify(cartao));

// Resultado:
// ❌ Assinatura inválida detectada
// ❌ Dados descartados
// ❌ Atividade registrada para análise
// ❌ Carrinho recarregado vazio
```

### Exemplo: Detectar DevTools
```javascript
// Se abrir DevTools durante checkout:
// Ao clicar em "Confirmar Compra"
// ❌ DevTools detectado
// ❌ Checkout cancelado
// ❌ Aviso exibido ao usuário
// ❌ Atividade registrada
```

## Verificar Atividades Suspeitas

Para verificar atividades suspeitas registradas:

```javascript
// No console do navegador:
const suspeitas = JSON.parse(localStorage.getItem('suspeitas_seguranca'));
console.table(suspeitas);
```

## Limitações e Considerações

⚠️ **Importante:** Esta é uma proteção de **frontend**. 

Para máxima segurança em produção:
1. **Implementar validação no backend** (obrigatório)
2. **Usar HTTPS** (obrigatório)
3. **Implementar autenticação robusta** (recomendado)
4. **Usar API segura para processamento de pagamentos** (obrigatório)
5. **Implementar rate limiting** (recomendado)
6. **Registrar logs de transações no servidor** (recomendado)

## API do Módulo SECURITY

```javascript
// Usar assinatura digital
SECURITY.assinarDados(dados)
SECURITY.validarAssinatura(dadosAssinados)
SECURITY.salvarDadosProtegidos(chave, dados)
SECURITY.carregarDadosProtegidos(chave)

// Validações
SECURITY.validarCarrinho(carrinho)
SECURITY.validarCheckout(dados)

// Detecção
SECURITY.detectarManipulacao()
SECURITY.verificarDevTools()

// Registro
SECURITY.registrarAtividadeSuspeita(atividade)

// Utilitários
SECURITY.gerarHash(dados)
SECURITY.sanitizar(string)
```

## Testes Recomendados

1. ✅ Abrir DevTools e tentar modificar carrinho
2. ✅ Tentar adicionar quantidade negativa
3. ✅ Tentar mudar preço de um produto
4. ✅ Tentar completar checkout com DevTools aberto
5. ✅ Tentar adicionar produto inexistente
6. ✅ Tentar modificar validade de dados
7. ✅ Tentar alterar estrutura do carrinho
8. ✅ Verificar logs de atividades suspeitas

## Histórico de Implementação

- **v1.0** (01/12/2025)
  - Assinatura digital de dados
  - Validação de tipos
  - Detecção de DevTools
  - Registro de atividades
  - Sanitização de XSS
  - Validação de email, telefone, CEP
  - Proteção de checkout

---

**Desenvolvido por:** Seu Nome  
**Data:** 01 de Dezembro de 2025  
**Status:** ✅ Ativo e Protegido
