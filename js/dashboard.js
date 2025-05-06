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
      window.location.href = '../index.html';
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
    // Exibir mensagem de erro na interface
    showErrorState('Ocorreu um erro ao carregar os dados do dashboard.');
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
  
  // Botão de adicionar imóvel
  const addPropertyBtn = document.getElementById('addPropertyBtn');
  if (addPropertyBtn) {
    addPropertyBtn.addEventListener('click', () => {
      const modal = document.getElementById('addPropertyModal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    });
  }
  
  // Filtro de mês
  const monthFilter = document.getElementById('monthFilter');
  if (monthFilter) {
    // Preencher mês atual como selecionado
    const currentMonth = new Date().getMonth() + 1; // getMonth retorna 0-11
    monthFilter.value = currentMonth.toString();
    
    monthFilter.addEventListener('change', () => {
      loadAndDisplayProperties(monthFilter.value === 'all' ? null : monthFilter.value);
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
};

// Inicializar quando a página for carregada
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('dashboard')) {
    initDashboard();
  }
});
