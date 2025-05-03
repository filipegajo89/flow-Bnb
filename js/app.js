// Arquivo principal da aplicação FlowBnb

// Inicializar a aplicação
const initApp = () => {
  console.log('Inicializando aplicação FlowBnb...');
  
  // Verificar se é a primeira execução
  checkFirstRun();
  
  // Verificar autenticação
  auth.onAuthStateChanged(user => {
    if (user) {
      // Usuário logado
      console.log('Usuário logado:', user.email);
      
      // Redirecionar para o dashboard se estiver na página inicial
      if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        window.location.href = '/pages/dashboard.html';
      }
    } else {
      // Usuário não logado
      console.log('Usuário não logado');
      
      // Configurar formulário de login/registro
      setupAuthForms();
    }
  });
};

// Verificar se é a primeira execução do aplicativo
const checkFirstRun = () => {
  const isFirstRun = localStorage.getItem('flowbnbFirstRun') !== 'false';
  
  if (isFirstRun) {
    console.log('Primeira execução detectada');
    
    // Marcar que não é mais a primeira execução
    localStorage.setItem('flowbnbFirstRun', 'false');
    
    // Exibir mensagem de boas-vindas ou tutorial
    // (será implementado em versão futura)
  }
};

// Configurar formulários de autenticação
const setupAuthForms = () => {
  const loginForm = document.getElementById('loginForm');
  const registerLink = document.getElementById('registerLink');
  
  if (loginForm) {
    // Definir modo inicial
    loginForm.dataset.mode = 'login';
    
    // Listener para envio do formulário
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      
      const email = loginForm.email.value;
      const password = loginForm.password.value;
      
      if (loginForm.dataset.mode === 'register') {
        // Modo de registro
        register(email, password)
          .catch(error => {
            alert('Erro no registro: ' + error.message);
          });
      } else {
        // Modo de login
        login(email, password)
          .catch(error => {
            alert('Erro no login: ' + error.message);
          });
      }
    });
  }
  
  if (registerLink) {
    // Alternar entre login e registro
    registerLink.addEventListener('click', e => {
      e.preventDefault();
      
      if (loginForm.dataset.mode === 'register') {
        // Voltar para login
        loginForm.dataset.mode = 'login';
        registerLink.textContent = 'Registre-se';
        loginForm.querySelector('button[type="submit"]').textContent = 'Entrar';
      } else {
        // Mudar para registro
        loginForm.dataset.mode = 'register';
        registerLink.textContent = 'Voltar para login';
        loginForm.querySelector('button[type="submit"]').textContent = 'Registrar';
      }
    });
  }
};

// Inicializar quando a página for carregada
document.addEventListener('DOMContentLoaded', initApp);
