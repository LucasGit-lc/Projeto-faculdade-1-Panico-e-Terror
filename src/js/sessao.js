// Gerenciar sessão do usuário no frontend
// Salvar, carregar e limpar sessão do usuário usando localStorage

const SESSAO_CHAVE = 'usuarioLogado';

function salvarSessao(usuario) {
  if (!usuario || !usuario.email) return;
  localStorage.setItem(SESSAO_CHAVE, JSON.stringify(usuario));
}

function obterSessao() {
  const dados = localStorage.getItem(SESSAO_CHAVE);
  try {
    return dados ? JSON.parse(dados) : null;
  } catch {
    return null;
  }
}

function limparSessao() {
  localStorage.removeItem(SESSAO_CHAVE);
}

// Atualizar UI básica de cabeçalho se existir
function atualizarUIUsuarioLogado() {
  const usuario = obterSessao();
  const headerActions = document.querySelector('.header-actions');
  if (!headerActions) return;

  const loginLink = headerActions.querySelector('.logar');
  const cadastroLink = headerActions.querySelector('.cadastro');

  // Criar container de usuário logado
  let userBox = headerActions.querySelector('.user-box');
  if (!userBox) {
    userBox = document.createElement('div');
    userBox.className = 'user-box';
    userBox.style.marginLeft = '10px';
    headerActions.appendChild(userBox);
  }

  userBox.innerHTML = '';

  if (usuario) {
    if (loginLink) loginLink.style.display = 'none';
    if (cadastroLink) cadastroLink.style.display = 'none';

    const nomeSpan = document.createElement('span');
    nomeSpan.textContent = `Olá, ${usuario.nome || usuario.email}`;
    nomeSpan.style.marginRight = '10px';

    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Sair';
    logoutBtn.style.padding = '6px 10px';
    logoutBtn.style.cursor = 'pointer';
    logoutBtn.addEventListener('click', () => {
      limparSessao();
      // Atualizar UI e redirecionar opcionalmente
      atualizarUIUsuarioLogado();
      window.location.href = 'home.html';
    });

    userBox.appendChild(nomeSpan);
    userBox.appendChild(logoutBtn);
  } else {
    if (loginLink) loginLink.style.display = '';
    if (cadastroLink) cadastroLink.style.display = '';
  }
}

// Atualiza ao carregar páginas
document.addEventListener('DOMContentLoaded', atualizarUIUsuarioLogado);

// Disponibilizar helpers globalmente
window.Sessao = { salvarSessao, obterSessao, limparSessao, atualizarUIUsuarioLogado };