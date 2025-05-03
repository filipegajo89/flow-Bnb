// Funções do Dashboard

// Inicializar a dashboard
const initDashboard = () => {
  console.log('Inicializando dashboard...');
  
  // Verificar autenticação
  auth.onAuthStateChanged(user => {
    if (user) {
      console.log('Usuário autenticado:', user.email);
      
      // Atualizar informações do usuário
      updateUserInfo(user);
      
      // Carregar dados do dashboard
      loadDashboardData();
    } else {
      // Redirecionar para a página de login
      window.location.href = '/index.html';
    }
  });
};

// Atualizar informações do usuário na interface
const updateUserInfo = (user) => {
  const userNameEl = document.getElementById('userName');
  if (userNameEl) {
    userNameEl.textContent = user.email;
  }
};

// Carregar dados do dashboard
const loadDashboardData = async () => {
  try {
    // Carregar imóveis e transações
    await loadAndDisplayProperties();
    await loadRecentTransactions();
    
    // Configurar listeners dos botões e elementos interativos
    setupDashboardListeners();
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error);
  }
};

// Configurar listeners dos elementos do dashboard
const setupDashboardListeners = () => {
  // Botão de logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', e => {
      e.preventDefault();
      logout();
    });
  }
  
  // Menu de usuário
  const userMenuBtn = document.getElementById('userMenuBtn');
  if (userMenuBtn) {
    userMenuBtn.addEventListener('click', () => {
      // Implementar dropdown de usuário
      // (será implementado em versão futura)
    });
  }
  
  // Links do menu lateral
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      // Não implementado nesta versão inicial
      if (!link.classList.contains('bg-blue-800')) {
        e.preventDefault();
        alert('Esta funcionalidade será implementada em breve!');
      }
    });
  });
};

// Inicializar quando a página for carregada
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('dashboard')) {
    initDashboard();
  }
});
