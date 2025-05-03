// Funções de autenticação de usuários

// Verificar estado de autenticação
auth.onAuthStateChanged(user => {
  if (user) {
    // Usuário logado
    console.log('Usuário logado:', user.email);
    
    // Se estiver na página inicial, redirecionar para o dashboard
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
      window.location.href = '/pages/dashboard.html';
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
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
      window.location.href = '/index.html';
    }
  }
});

// Função de login
const login = (email, password) => {
  return auth.signInWithEmailAndPassword(email, password)
    .catch(error => {
      console.error('Erro no login:', error);
      alert('Erro no login: ' + error.message);
      throw error;
    });
};

// Função de registro de novo usuário
const register = (email, password) => {
  return auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      // Criar documento do usuário no Firestore
      return db.collection('users').doc(cred.user.uid).set({
        email: email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .catch(error => {
      console.error('Erro no registro:', error);
      alert('Erro no registro: ' + error.message);
      throw error;
    });
};

// Função de logout
const logout = () => {
  return auth.signOut()
    .then(() => {
      console.log('Usuário deslogado');
      window.location.href = '/index.html';
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
  // Form de login
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = loginForm.email.value;
      const password = loginForm.password.value;
      login(email, password);
    });
  }
  
  // Link para registro
  const registerLink = document.getElementById('registerLink');
  if (registerLink) {
    registerLink.addEventListener('click', e => {
      e.preventDefault();
      
      // Alternar entre login e registro
      const loginForm = document.getElementById('loginForm');
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
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
  
  // Form de login/registro
  const authForm = document.getElementById('loginForm');
  if (authForm) {
    authForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = authForm.email.value;
      const password = authForm.password.value;
      
      if (authForm.dataset.mode === 'register') {
        register(email, password);
      } else {
        login(email, password);
      }
    });
  }
  
  // Botão de logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', e => {
      e.preventDefault();
      logout();
    });
  }
});
