// Funções de autenticação de usuários
console.log('Arquivo auth.js carregado');

// Helper para determinar caminhos
const pathHelper = {
  isLoginPage: function() {
    const path = window.location.pathname;
    return path.endsWith('/index.html') || path === '/' || path.endsWith('/');
  },
  
  getDashboardPath: function() {
    // Ajusta o caminho baseado na estrutura do projeto
    if (window.location.hostname.includes('github.io')) {
      // Se estiver no GitHub Pages
      return './pages/dashboard.html';
    } else {
      // Se estiver em ambiente local ou outro
      return './pages/dashboard.html';
    }
  },
  
  getLoginPath: function() {
    // Ajusta o caminho baseado na estrutura do projeto
    if (window.location.pathname.includes('/pages/')) {
      return '../index.html';
    } else {
      return './index.html';
    }
  }
};

// Flag para controlar redirecionamentos
let isRedirecting = false;

// Verificar estado de autenticação
auth.onAuthStateChanged(user => {
  // Evitar múltiplos redirecionamentos
  if (isRedirecting) return;
  
  if (user) {
    // Usuário logado
    console.log('Usuário logado:', user.email);
    
    // Apenas redirecionar se estiver na página de login e o usuário fez login manualmente
    if (pathHelper.isLoginPage() && sessionStorage.getItem('login_attempt') === 'true') {
      console.log('Redirecionando para dashboard após login...');
      isRedirecting = true;
      sessionStorage.removeItem('login_attempt');
      window.location.href = pathHelper.getDashboardPath();
      return;
    }
    
    // Atualizar UI com informações do usuário logado
    if (document.getElementById('userName')) {
      document.getElementById('userName').textContent = user.email;
    }
    
    // Carregar dados do usuário
    loadUserData(user.uid);
  } else {
    // Usuário não logado
    console.log('Usuário não logado');
    
    // Se estiver em página que requer autenticação, redirecionar para login
    if (!pathHelper.isLoginPage()) {
      console.log('Redirecionando para login...');
      isRedirecting = true;
      window.location.href = pathHelper.getLoginPath();
      return;
    }
  }
});

// Função de login
const login = (email, password) => {
  console.log('Tentando login com:', email);
  
  // Marcar que houve uma tentativa de login manual
  sessionStorage.setItem('login_attempt', 'true');
  
  return auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      console.log('Login bem-sucedido:', userCredential.user.email);
      return userCredential;
    })
    .catch(error => {
      console.error('Erro no login:', error);
      alert('Erro no login: ' + error.message);
      sessionStorage.removeItem('login_attempt');
      throw error;
    });
};

// Função de registro de novo usuário
const register = (email, password) => {
  console.log('Tentando registrar:', email);
  
  // Marcar que houve uma tentativa de registro
  sessionStorage.setItem('login_attempt', 'true');
  
  return auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      console.log('Registro bem-sucedido:', cred.user.email);
      // Criar documento do usuário no Firestore
      return db.collection('users').doc(cred.user.uid).set({
        email: email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .catch(error => {
      console.error('Erro no registro:', error);
      alert('Erro no registro: ' + error.message);
      sessionStorage.removeItem('login_attempt');
      throw error;
    });
};

// Função de logout
const logout = () => {
  return auth.signOut()
    .then(() => {
      console.log('Usuário deslogado');
      window.location.href = pathHelper.getLoginPath();
    })
    .catch(error => {
      console.error('Erro no logout:', error);
      alert('Erro no logout: ' + error.message);
    });
};

// Carregar dados do usuário
const loadUserData = (userId) => {
  return db.collection('users').doc(userId).get()
    .then(doc => {
      if (doc.exists) {
        const userData = doc.data();
        console.log('Dados do usuário:', userData);
        return userData;
      } else {
        console.log('Nenhum documento de usuário encontrado');
        return null;
      }
    })
    .catch(error => {
      console.error('Erro ao carregar dados do usuário:', error);
    });
};

// Adicionar ouvintes para botões de autenticação
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM carregado, configurando ouvintes de autenticação');
  
  // Form de login
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    console.log('Form de login encontrado');
    // Inicializar modo do formulário
    if (!loginForm.dataset.mode) {
      loginForm.dataset.mode = 'login';
    }
    
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      console.log('Form de login enviado no modo:', loginForm.dataset.mode);
      
      const email = loginForm.email.value;
      const password = loginForm.password.value;
      
      if (loginForm.dataset.mode === 'register') {
        register(email, password);
      } else {
        login(email, password);
      }
    });
  }
  
  // Link para registro
  const registerLink = document.getElementById('registerLink');
  if (registerLink) {
    console.log('Link de registro encontrado');
    
    registerLink.addEventListener('click', e => {
      e.preventDefault();
      
      // Alternar entre login e registro
      const loginForm = document.getElementById('loginForm');
      const submitButton = loginForm.querySelector('button[type="submit"]');
      
      if (loginForm.dataset.mode === 'register') {
        // Voltar para login
        loginForm.dataset.mode = 'login';
        submitButton.textContent = 'Entrar';
        registerLink.textContent = 'Registre-se';
      } else {
        // Mudar para registro
        loginForm.dataset.mode = 'register';
        submitButton.textContent = 'Registrar';
        registerLink.textContent = 'Voltar para login';
      }
    });
  }
  
  // Botão de logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    console.log('Botão de logout encontrado');
    
    logoutBtn.addEventListener('click', e => {
      e.preventDefault();
      logout();
    });
  }
});
