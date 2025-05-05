// Funções de autenticação de usuários
console.log('Arquivo auth.js carregado');

// Flag para controlar redirecionamentos e evitar loops
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

// Verificar estado de autenticação
auth.onAuthStateChanged(user => {
  console.log('Estado de autenticação alterado:', user ? 'Usuário logado' : 'Usuário não logado');
  
  // Evitar múltiplos redirecionamentos
  if (isRedirecting) {
    console.log('Redirecionamento já em andamento, ignorando verificação');
    return;
  }

  // Adicione esta função ao arquivo auth.js para traduzir e tratar erros do Firebase

// Função para traduzir e tratar erros do Firebase
const handleFirebaseError = (error) => {
  console.error('Erro Firebase:', error);
  let message = 'Ocorreu um erro. Tente novamente.';
  
  switch (error.code) {
    case 'auth/quota-exceeded':
      message = 'Limite de tentativas de login excedido. Por favor, tente novamente mais tarde ou use outro método de login.';
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
      message = 'Muitas tentativas incorretas. Tente novamente mais tarde ou redefina sua senha.';
      break;
    case 'auth/requires-recent-login':
      message = 'Esta operação requer um login recente. Por favor, faça login novamente.';
      break;
    case 'auth/invalid-credential':
      message = 'Credenciais inválidas. Verifique seu email e senha.';
      break;
    case 'auth/operation-not-allowed':
      message = 'Este método de login não está habilitado. Contate o suporte.';
      break;
    case 'auth/account-exists-with-different-credential':
      message = 'Este email já está associado a outra conta. Tente outro método de login.';
      break;
    default:
      message = `Erro: ${error.message}`;
  }
  
  return message;
};

// Modificar a função de login para incluir o novo tratamento de erros
const login = (email, password) => {
  console.log('Tentando login com:', email);
  manualLoginAttempt = true;
  
  return auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      console.log('Login bem-sucedido:', userCredential.user.email);
      return userCredential;
    })
    .catch(error => {
      console.error('Erro no login:', error);
      manualLoginAttempt = false;
      
      // Usar a nova função de tratamento de erros
      const errorMessage = handleFirebaseError(error);
      alert(errorMessage);
      
      throw error;
    });
};

// Também atualizar a função de registro
const register = (email, password) => {
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
      
      // Usar a nova função de tratamento de erros
      const errorMessage = handleFirebaseError(error);
      alert(errorMessage);
      
      throw error;
    });
};
  
  // Verificar se está na página de login
  const isLoginPage = window.location.pathname.includes('index.html') || 
                      window.location.pathname === '/' || 
                      window.location.pathname.endsWith('/');
  
  if (user) {
    // Usuário logado
    console.log('Usuário autenticado:', user.email);
    
    // Apenas redirecionar se estiver na página de login e for um login manual
    if (isLoginPage && manualLoginAttempt) {
      console.log('Login manual detectado, redirecionando para dashboard');
      isRedirecting = true;
      manualLoginAttempt = false;
      
      // Redirecionar para o dashboard
      const dashboardPath = getRelativePath('pages/dashboard.html');
      console.log('Redirecionando para:', dashboardPath);
      window.location.href = dashboardPath;
      return;
    }
    
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
      
      // Determinar o caminho correto para a página de login
      let loginPath = '../index.html';
      if (window.location.pathname.includes('property-details')) {
        loginPath = '../index.html';
      }
      
      console.log('Redirecionando para:', loginPath);
      window.location.href = loginPath;
      return;
    }
  }
});

// Função de login
const login = (email, password) => {
  console.log('Tentando login com:', email);
  manualLoginAttempt = true;
  
  return auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      console.log('Login bem-sucedido:', userCredential.user.email);
      return userCredential;
    })
    .catch(error => {
      console.error('Erro no login:', error);
      manualLoginAttempt = false;
      alert('Erro no login: ' + error.message);
      throw error;
    });
};

// Função de registro de novo usuário
const register = (email, password) => {
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
      alert('Erro no registro: ' + error.message);
      throw error;
    });
};

// Função de logout
const logout = () => {
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
};

// Carregar dados do usuário
const loadUserData = (userId) => {
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
};

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
});
