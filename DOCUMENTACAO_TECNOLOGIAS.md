DOCUMENTAÇÃO DAS TECNOLOGIAS UTILIZADAS NO PROJETO PANICO E TERROR

1 INTRODUÇÃO

Este documento apresenta as principais tecnologias utilizadas no desenvolvimento do sistema de e-commerce "Panico e Terror - Moda Esportiva", detalhando suas características técnicas, funcionalidades e aplicações específicas no projeto. A seleção das tecnologias foi baseada em critérios de performance, escalabilidade, manutenibilidade e adequação aos requisitos funcionais do sistema.

2 TECNOLOGIAS UTILIZADAS

2.1 Node.js

2.1.1 Definição e Características

Node.js é um ambiente de execução JavaScript construído sobre o motor V8 do Google Chrome, que permite a execução de código JavaScript no lado servidor. Caracteriza-se por sua arquitetura orientada a eventos e modelo de I/O não-bloqueante, proporcionando alta performance em aplicações que demandam processamento intensivo de requisições simultâneas.

2.1.2 Aplicação no Projeto

O Node.js é utilizado no projeto para o desenvolvimento do servidor backend, proporcionando um ambiente de execução eficiente para JavaScript no lado servidor. Sua arquitetura orientada a eventos permite o processamento assíncrono de requisições, otimizando o desempenho da aplicação web.

**Utilização Detalhada:**

**Arquivo: `src/js/server.js`**
- **Objetivo:** Criar o servidor web principal da aplicação
- **Funcionalidade:** Gerenciar requisições HTTP, servir arquivos estáticos, processar rotas da API
- **Implementação:** Utiliza módulos nativos do Node.js para criar servidor HTTP e gerenciar sistema de arquivos

**Arquivo: `package.json`**
- **Objetivo:** Configurar dependências e scripts de automação do projeto
- **Funcionalidade:** Definir metadados do projeto, listar dependências necessárias, criar comandos de execução
- **Implementação:** Especifica scripts para inicialização do servidor e gerenciamento de dependências

**Arquivo: `package-lock.json`**
- **Objetivo:** Garantir versionamento consistente das dependências
- **Funcionalidade:** Bloquear versões específicas de pacotes para evitar conflitos
- **Implementação:** Gerado automaticamente pelo npm para controle de versões

2.2 JavaScript

2.2.1 Definição e Características

JavaScript é uma linguagem de programação interpretada, dinâmica e orientada a objetos, baseada em protótipos. Constitui-se como a linguagem padrão para desenvolvimento web client-side e, em conjunto com Node.js, também para aplicações server-side. Suas principais características incluem tipagem dinâmica, suporte a programação funcional e orientada a objetos, e capacidade de execução assíncrona.

2.2.2 Aplicação no Projeto

O JavaScript é empregado no projeto para implementar a lógica de interação do usuário, manipulação do DOM e comunicação com APIs. Sua versatilidade permite a criação de funcionalidades dinâmicas e responsivas, melhorando significativamente a experiência do usuário na aplicação web.

**Utilização Detalhada:**

**Arquivo: `src/js/home.js`**
- **Objetivo:** Controlar a interatividade da página inicial
- **Funcionalidade:** Gerenciar navegação entre seções, animações de entrada, carregamento dinâmico de conteúdo
- **Implementação:** Manipulação do DOM, event listeners para interações do usuário, controle de elementos visuais

**Arquivo: `src/js/produtos.js`**
- **Objetivo:** Implementar sistema de catálogo de produtos
- **Funcionalidade:** Exibir lista de produtos, filtros de categoria/preço, busca, paginação
- **Implementação:** Renderização dinâmica de produtos, sistema de filtros, integração com dados mockados

**Arquivo: `src/js/carrinho.js`**
- **Objetivo:** Gerenciar funcionalidades do carrinho de compras
- **Funcionalidade:** Adicionar/remover produtos, calcular totais, persistir dados localmente
- **Implementação:** LocalStorage para persistência, cálculos matemáticos, atualização dinâmica da interface

**Arquivo: `src/js/login.js`**
- **Objetivo:** Implementar sistema de autenticação
- **Funcionalidade:** Validação de formulários, autenticação de usuários, controle de sessão
- **Implementação:** Validação de campos, simulação de login, gerenciamento de estado de autenticação

**Arquivo: `src/js/server.js`**
- **Objetivo:** Executar lógica do servidor backend
- **Funcionalidade:** Processar requisições, servir arquivos, gerenciar rotas da API
- **Implementação:** Servidor HTTP nativo, roteamento manual, servir arquivos estáticos

2.3 HTML5

2.3.1 Definição e Características

HTML5 (HyperText Markup Language versão 5) constitui a quinta e mais recente versão da linguagem de marcação HTML, padronizada pelo World Wide Web Consortium (W3C) e pelo Web Hypertext Application Technology Working Group (WHATWG). Esta versão introduz elementos semânticos aprimorados, suporte nativo para conteúdo multimídia e APIs JavaScript integradas, proporcionando maior acessibilidade e otimização para mecanismos de busca.

2.3.2 Aplicação no Projeto

O HTML5 é utilizado como base estrutural de todas as páginas da aplicação web, fornecendo elementos semânticos que melhoram a acessibilidade e a organização do conteúdo. Seus recursos avançados contribuem para uma melhor indexação pelos motores de busca e uma experiência de usuário mais rica.

**Utilização Detalhada:**

**Arquivo: `index.html`**
- **Objetivo:** Servir como página de entrada principal da aplicação
- **Funcionalidade:** Apresentar estrutura inicial, links de navegação, carregamento de recursos
- **Implementação:** Elementos semânticos (header, nav, main, footer), meta tags para SEO, links para CSS/JS

**Arquivo: `home.html`**
- **Objetivo:** Apresentar a página inicial do site de terror
- **Funcionalidade:** Exibir conteúdo promocional, destaques, navegação principal
- **Implementação:** Seções semânticas, elementos de mídia, estrutura responsiva

**Arquivo: `produtos.html`**
- **Objetivo:** Estruturar a página de catálogo de produtos
- **Funcionalidade:** Container para lista de produtos, filtros, sistema de busca
- **Implementação:** Grid layout, formulários de filtro, containers dinâmicos para produtos

**Arquivo: `carrinho.html`**
- **Objetivo:** Organizar a interface do carrinho de compras
- **Funcionalidade:** Tabela de produtos, cálculos de total, formulário de checkout
- **Implementação:** Tabelas semânticas, formulários de entrada, botões de ação

**Arquivo: `login.html`**
- **Objetivo:** Estruturar a página de autenticação
- **Funcionalidade:** Formulários de login/registro, validação visual
- **Implementação:** Formulários acessíveis, campos de entrada validados, mensagens de erro

2.4 CSS3

2.4.1 Definição e Características

CSS3 (Cascading Style Sheets versão 3) representa a terceira geração da linguagem de folhas de estilo em cascata, responsável pela definição da apresentação visual e layout de documentos HTML. Esta versão incorpora recursos avançados como animações, transições, transformações, gradientes e sistemas de layout flexíveis, permitindo maior controle sobre a apresentação visual e responsividade das interfaces.

2.4.2 Aplicação no Projeto

O CSS3 é responsável pela estilização e apresentação visual da aplicação web, implementando layouts responsivos e efeitos visuais modernos. Suas funcionalidades avançadas permitem a criação de interfaces atrativas e funcionais, adaptáveis a diferentes dispositivos e tamanhos de tela.

**Utilização Detalhada:**

**Arquivo: `src/css/style.css`**
- **Objetivo:** Definir estilos globais e componentes reutilizáveis
- **Funcionalidade:** Tipografia base, cores do tema, componentes comuns (botões, cards)
- **Implementação:** Variáveis CSS, classes utilitárias, estilos de componentes base

**Arquivo: `src/css/home.css`**
- **Objetivo:** Estilizar especificamente a página inicial
- **Funcionalidade:** Layout hero, seções promocionais, animações de entrada
- **Implementação:** Flexbox/Grid layouts, animações CSS, media queries responsivas

**Arquivo: `src/css/produtos.css`**
- **Objetivo:** Criar layout e visual da página de produtos
- **Funcionalidade:** Grid de produtos, filtros laterais, cards de produto
- **Implementação:** CSS Grid para layout, hover effects, sistema de filtros visuais

**Arquivo: `src/css/carrinho.css`**
- **Objetivo:** Estilizar interface do carrinho de compras
- **Funcionalidade:** Tabela responsiva, botões de ação, cálculos visuais
- **Implementação:** Tabelas responsivas, estados de botões, feedback visual

**Arquivo: `src/css/reset.css`**
- **Objetivo:** Normalizar estilos padrão entre navegadores
- **Funcionalidade:** Remover inconsistências de CSS padrão dos navegadores
- **Implementação:** Reset de margins/paddings, box-sizing, estilos de formulário

**Arquivo: `home.css` (raiz)**
- **Objetivo:** Estilos adicionais ou sobrescritas específicas
- **Funcionalidade:** Customizações específicas da página home
- **Implementação:** Estilos complementares ou alternativos para a página inicial

2.5 PostgreSQL

2.5.1 Definição e Características

PostgreSQL é um sistema de gerenciamento de banco de dados objeto-relacional (ORDBMS) de código aberto, reconhecido por sua robustez, extensibilidade e conformidade com padrões SQL. Caracteriza-se pela implementação completa das propriedades ACID (Atomicidade, Consistência, Isolamento e Durabilidade), suporte a tipos de dados avançados e capacidade de extensão através de funções personalizadas.

2.5.2 Aplicação no Projeto

O PostgreSQL é utilizado como sistema de gerenciamento de banco de dados da aplicação, armazenando informações de usuários, produtos e transações. Sua robustez e confiabilidade garantem a integridade dos dados e suportam operações complexas necessárias para o funcionamento adequado da aplicação web.

**Utilização Detalhada:**

**Integração Planejada com `src/js/server.js`**
- **Objetivo:** Estabelecer conexão entre aplicação e banco de dados
- **Funcionalidade:** Gerenciar conexões, executar queries, tratar transações
- **Implementação:** Configuração de connection pool, queries preparadas, tratamento de erros

**Estrutura de Dados Atual (Mockados)**
- **Objetivo:** Simular estrutura de dados real durante desenvolvimento
- **Funcionalidade:** Fornecer dados de teste para produtos, usuários, carrinho
- **Implementação:** Arrays e objetos JavaScript simulando tabelas do banco

**Migração Futura Planejada:**
- **Tabela Produtos:** Armazenar catálogo completo (id, nome, preço, categoria, imagem, descrição)
- **Tabela Usuários:** Gerenciar autenticação (id, email, senha hash, dados pessoais)
- **Tabela Carrinho:** Persistir itens do carrinho (user_id, product_id, quantidade)
- **Tabela Pedidos:** Histórico de compras (id, user_id, total, data, status)

**Funcionalidades de Banco Planejadas:**
- **Objetivo:** Substituir dados estáticos por persistência real
- **Funcionalidade:** CRUD completo, relacionamentos, consultas complexas, backup
- **Implementação:** Queries SQL otimizadas, índices, constraints, triggers

3 CONSIDERAÇÕES FINAIS

O conjunto de tecnologias selecionado para o desenvolvimento do sistema "Panico e Terror" constitui uma arquitetura tecnológica moderna e eficiente, proporcionando fundamentos sólidos para a implementação de uma aplicação web robusta e escalável. A integração entre Node.js, JavaScript, HTML5, CSS3 e PostgreSQL oferece as ferramentas necessárias para a criação de uma experiência de usuário otimizada e um sistema backend confiável para operações de comércio eletrônico.

REFERÊNCIAS

MOZILLA DEVELOPER NETWORK. JavaScript | MDN. Disponível em: https://developer.mozilla.org/en-US/docs/Web/JavaScript. Acesso em: jan. 2025.

NODE.JS FOUNDATION. Node.js Documentation. Disponível em: https://nodejs.org/en/docs. Acesso em: jan. 2025.

NODE.JS FOUNDATION. About this documentation | Node.js v24.7.0 Documentation. Disponível em: https://nodejs.org/api/documentation.html. Acesso em: jan. 2025.

POSTGRESQL GLOBAL DEVELOPMENT GROUP. PostgreSQL Documentation. Disponível em: https://www.postgresql.org/docs/. Acesso em: jan. 2025.

POSTGRESQL GLOBAL DEVELOPMENT GROUP. Bibliography - PostgreSQL 17 Documentation. Disponível em: https://www.postgresql.org/docs/17/biblio.html. Acesso em: jan. 2025.

W3C. CSS Snapshot 2024. Disponível em: https://www.w3.org/TR/css-2024/. Acesso em: jan. 2025.

WHATWG. HTML Standard. Disponível em: https://html.spec.whatwg.org/. Acesso em: jan. 2025.
