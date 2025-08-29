
function logout() {
  alert('Logout realizado com sucesso!');
  window.location.href = 'login.html';
}


document.addEventListener('DOMContentLoaded', () => {
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', logout);
  }
});