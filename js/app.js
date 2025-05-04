// Arquivo principal da aplicação FlowBnb
console.log('Arquivo app.js carregado');

// Inicializar a aplicação
const initApp = () => {
  console.log('Inicializando aplicação FlowBnb...');
  
  // Verificar se é a primeira execução
  checkFirstRun();
  
  // Não duplicamos a verificação de autenticação aqui
  // Isso já está sendo feito em auth.js
  
  // Adicionar logs para depuração
  console.log('Caminho atual:', window.location.pathname);
  console.log('URL completa:', window.location.href);
};

// Verificar se é a primeira execução do aplicativo
const checkFirstRun = () => {
  const isFirstRun = localStorage.getItem('flowbnbFirstRun') !== 'false';
  
  if (isFirstRun) {
    console.log('Primeira execução detectada');
    
    // Marcar que não é mais a primeira execução
    localStorage.setItem('flowbnbFirstRun', 'false');
    
    // Exibir mensagem de boas-vindas ou tutorial (versão futura)
  }
};

// Inicializar quando a página for carregada
document.addEventListener('DOMContentLoaded', initApp);
