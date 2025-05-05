// Funções de autenticação de usuários
console.log('Arquivo auth.js carregado');

// Variáveis globais para controle de redirecionamento
let isRedirecting = false;
let manualLoginAttempt = false;

// Helper para determinar caminhos
const getRelativePath = (path) => {
  // Se estiver no GitHub Pages, ajusta o caminho
  if (window.location.hostname.includes('github.io')) {
    return './' + path;
  } else {
    return path;
  }
};

// Função para traduzir e tratar erros do Firebase
function handleFirebaseError(error) {
  console.error('Erro Firebase:', error);
  let message = 'Ocorreu um erro. Tente novamente.';
  
  switch (error.code) {
    case 'auth/quota-exceeded':
      message = 'Limite de tentativas de login excedido. Por favor, tente novamente mais tarde.';
      break;
    case 'auth/user-not-found':
      message = 'Usuário não encontrado. Verifique seu email ou crie uma nova conta.';
      break;
    case 'auth/wrong-password':
      message = 'Senha incorreta. Verifique sua senha e tente novamente.';
      break;
    case 'auth/invalid-email':
      message = 'Email inválido. Por favor, verifique o formato do email.';
      break;
    case 'auth/email-already-in-use':
      message = 'Este email já está em uso. Tente fazer login ou use outro email.';
      break;
    case 'auth/weak-password':
      message = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
      break;
    case 'auth/network-request-failed':
      message = 'Erro de conexão. Verifique sua internet e tente novamente.';
      break;
    case 'auth/too-many-requests':
      message = 'Muitas tentativas incorretas. Tente novamente mais tarde.';
      break;
    case 'auth/requires-recent-login':
      message = 'Esta operação requer um login recente. Por favor, faça login novamente.';
      break;
    default:
      message = `Erro: ${error.message}`;
  }
  
  return message;
}

// Verificar estado de autenticação
auth.onAuthStateChanged(user => {
  console.log('Estado de autenticação alterado:', user ? 'Usuário logado' : 'Usuário não logado');
  
  // Evitar múltiplos redirecionamentos
  if (isRedirecting) {
    console.log('Redirecionamento já em andamento, ignorando verificação');
    return;
  }
  
  // Verificar se está na página de login - simplificado
  const isLoginPage = window.location.pathname.includes('index.html') || 
                     window.location.pathname === '/' || 
                     window.location.pathname.endsWith('/');
  
  console.log('Caminho atual:', window.location.pathname);
  console.log('É página de login?', isLoginPage);
  
  if (user) {
    // Usuário logado
    console.log('Usuário autenticado:', user.email);
    
    // Redirecionar para dashboard se estiver na página de login
    if (isLoginPage) {
      console.log('Redirecionando para dashboard');
      isRedirecting = true;
      
      // Simplificar caminho para dashboard
      window.location.href = 'pages/dashboard.html';
      return;
    }
    
    // Atualizar UI com informações do usuário
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
      userNameElement.textContent = user.email;
    }
    
  } else {
    // Usuário não logado
    console.log('Nenhum usuário autenticado');
    
    // Se estiver em página protegida, redirecionar para login
    if (!isLoginPage) {
      console.log('Acesso a página protegida sem autenticação, redirecionando para login');
      isRedirecting = true;
      
      // Caminho simples para o login
      window.location.href = '../index.html';
      return;
    }
  }
});
    
    // Atualizar UI com informações do usuário logado
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
      userNameElement.textContent = user.email;
    }
    
    // Carregar dados do usuário
    loadUserData(user.uid);
  } else {
    // Usuário não logado
    console.log('Nenhum usuário autenticado');
    
    // Se estiver em página protegida, redirecionar para login
    if (!isLoginPage) {
      console.log('Acesso a página protegida sem autenticação, redirecionando para login');
      isRedirecting = true;
      
      // Determinar o caminho correto para o index.html
      let loginPath = '../index.html';
      if (currentPath.includes('property-details')) {
        loginPath = '../index.html';
      }
      
      console.log('Redirecionando para:', loginPath);
      window.location.href = loginPath;
      return;
    }
  }
});

// Função de login
function login(email, password) {
  console.log('Tentando login com:', email);
  
  return auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      console.log('Login bem-sucedido:', userCredential.user.email);
      return userCredential;
    })
    .catch(error => {
      console.error('Erro no login:', error);
      const errorMessage = handleFirebaseError(error);
      alert(errorMessage);
      throw error;
    });
}

// Função de registro de novo usuário
function register(email, password) {
  console.log('Tentando registrar:', email);
  manualLoginAttempt = true;
  
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
      manualLoginAttempt = false;
      const errorMessage = handleFirebaseError(error);
      alert(errorMessage);
      throw error;
    });
}

// Função de logout
function logout() {
  return auth.signOut()
    .then(() => {
      console.log('Usuário deslogado com sucesso');
      
      // Redirecionar para a página de login após logout
      window.location.href = '../index.html';
    })
    .catch(error => {
      console.error('Erro no logout:', error);
      alert('Erro no logout: ' + error.message);
    });
}

// Carregar dados do usuário
function loadUserData(userId) {
  return db.collection('users').doc(userId).get()
    .then(doc => {
      if (doc.exists) {
        const userData = doc.data();
        console.log('Dados do usuário carregados:', userData);
        return userData;
      } else {
        console.log('Nenhum documento de usuário encontrado');
        return null;
      }
    })
    .catch(error => {
      console.error('Erro ao carregar dados do usuário:', error);
    });
}

// Adicionar ouvintes para botões de autenticação
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM carregado, configurando listeners de autenticação');
  
  // Form de login
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    console.log('Form de login encontrado na página');
    
    // Inicializar modo do formulário
    if (!loginForm.dataset.mode) {
      loginForm.dataset.mode = 'login';
    }
    
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      console.log('Form submetido no modo:', loginForm.dataset.mode);
      
      const email = loginForm.email.value;
      const password = loginForm.password.value;
      
      if (loginForm.dataset.mode === 'register') {
        register(email, password);
      } else {
        login(email, password);
      }
    });
  }
  
  // Link para alternar entre login e registro
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
  
  // Verificar se existe o botão de toggle de senha
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function() {
      // Alternar entre mostrar e esconder a senha
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // Alternar o ícone
      this.classList.toggle('fa-eye');
      this.classList.toggle('fa-eye-slash');
    });
  }
});
